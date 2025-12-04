import { chatWithSystem } from './kolosalClient.js';
import { prisma } from '../models/prismaClient.js';

/**
 * Customer chat for menu recommendations
 * Returns structured JSON with intro, menu recommendations from database, and closing
 */
export async function handleCustomerChat(message) {
  // Get all available menus from database with category
  const availableMenus = await prisma.menu.findMany({
    where: { isAvailable: true },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  // Create menu list string for AI context
  const menuContext = availableMenus.map(
    (m) => `- ${m.name} (${m.category.name}) - Rp ${m.price.toLocaleString('id-ID')}`
  ).join('\n');

  const systemPrompt = `Anda adalah asisten restoran Ordira yang membantu pelanggan memilih menu.

MENU YANG TERSEDIA:
${menuContext}

TUGAS ANDA:
1. Baca permintaan pelanggan dengan cermat
2. Pilih 2-5 menu yang paling sesuai dari daftar menu di atas
3. Berikan response dalam format JSON STRICT dengan struktur:
{
  "intro": "Kalimat pembuka yang ramah (1-2 kalimat)",
  "recommendations": [1, 2, 3],
  "closing": "Kalimat penutup yang mengajak bertindak (1 kalimat)"
}

ATURAN:
- "intro": Sambutan ramah yang acknowledge permintaan pelanggan
- "recommendations": Array berisi ID menu (angka) yang direkomendasikan, pilih 2-5 menu
- "closing": Ajakan untuk memesan atau tanya lebih lanjut
- Hanya rekomendasikan menu yang ADA di daftar menu
- Response HARUS valid JSON, tidak ada teks tambahan
- Jangan gunakan markdown code block

CONTOH OUTPUT:
{"intro":"Untuk Anda yang suka pedas, saya punya rekomendasi yang pas!","recommendations":[1,3,5],"closing":"Silakan pilih menu favorit Anda dan selamat menikmati!"}`;

  const response = await chatWithSystem(systemPrompt, message, {
    temperature: 0.7,
    maxTokens: 300,
  });

  // Parse AI response
  let aiData;
  try {
    // Clean response from potential markdown code blocks
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '').trim();
    }
    
    aiData = JSON.parse(cleanResponse);
  } catch (error) {
    // Fallback if AI doesn't return valid JSON
    console.error('Failed to parse AI response:', error);
    aiData = {
      intro: 'Terima kasih atas pertanyaan Anda!',
      recommendations: availableMenus.slice(0, 3).map(m => m.id),
      closing: 'Silakan pilih menu yang Anda suka!',
    };
  }

  // Get full menu details for recommendations
  const recommendedMenus = availableMenus.filter(
    (menu) => aiData.recommendations.includes(menu.id)
  );

  // Return structured response
  return {
    intro: aiData.intro,
    recommendations: recommendedMenus,
    closing: aiData.closing,
  };
}

export default {
  handleCustomerChat,
};
