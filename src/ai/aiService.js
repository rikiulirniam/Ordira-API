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

  // Create menu list with ID for AI context
  const menuContext = availableMenus.map(
    (m) => `ID:${m.id} - ${m.name} (Kategori: ${m.category.name}) - Rp ${m.price.toLocaleString('id-ID')}`
  ).join('\n');

  const systemPrompt = `Anda adalah asisten restoran Ordira yang membantu pelanggan memilih menu.

DAFTAR MENU LENGKAP:
${menuContext}

CARA KERJA:
1. Identifikasi kata kunci utama dari permintaan pelanggan
2. Cari menu yang KATEGORI-nya cocok dengan kata kunci
3. Ambil ID menu yang sesuai dari daftar di atas
4. Rekomendasikan 2-5 menu yang paling relevan

PANDUAN KATEGORI:
- "minuman", "segar", "dingin", "es" → Pilih dari kategori: Minuman Dingin, Jus & Smoothie
- "kopi", "teh panas", "hangat" → Pilih dari kategori: Minuman Panas
- "nasi goreng" → Pilih dari kategori: Nasi Goreng
- "ayam" → Pilih dari kategori: Ayam
- "mie", "bakmi" → Pilih dari kategori: Mie
- "seafood", "udang", "ikan" → Pilih dari kategori: Seafood
- "pedas" → Pilih menu dengan kata: geprek, sambal, pedas
- "manis", "dessert", "penutup" → Pilih dari kategori: Dessert

FORMAT OUTPUT (JSON KETAT):
{
  "intro": "Sambutan yang sesuai permintaan",
  "recommendations": [ID1, ID2, ID3],
  "closing": "Ajakan untuk memesan"
}

CONTOH:
Input: "minuman segar dong"
Output: {"intro":"Untuk kesegaran Anda, saya rekomendasikan minuman dingin kami!","recommendations":[33,34,35],"closing":"Silakan pilih yang paling menggoda!"}

PENTING:
- Gunakan ID yang PERSIS dari daftar menu di atas
- Pastikan kategori menu sesuai dengan permintaan
- Output HARUS JSON murni tanpa markdown`;

  const response = await chatWithSystem(systemPrompt, message, {
    temperature: 0.3,
    maxTokens: 400,
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
    // Fallback with smart filtering based on keywords
    console.error('Failed to parse AI response:', error);
    
    // Try to do smart filtering based on message keywords
    const lowerMsg = message.toLowerCase();
    let filteredMenus = availableMenus;
    
    if (lowerMsg.includes('minuman') || lowerMsg.includes('segar') || lowerMsg.includes('dingin') || lowerMsg.includes('es')) {
      filteredMenus = availableMenus.filter(m => 
        m.category.name.includes('Minuman Dingin') || 
        m.category.name.includes('Jus') ||
        m.name.toLowerCase().includes('es') ||
        m.name.toLowerCase().includes('jus')
      );
    } else if (lowerMsg.includes('nasi goreng')) {
      filteredMenus = availableMenus.filter(m => m.category.name.includes('Nasi Goreng'));
    } else if (lowerMsg.includes('ayam')) {
      filteredMenus = availableMenus.filter(m => m.category.name.includes('Ayam'));
    } else if (lowerMsg.includes('kopi') || lowerMsg.includes('teh panas')) {
      filteredMenus = availableMenus.filter(m => m.category.name.includes('Minuman Panas'));
    }
    
    aiData = {
      intro: 'Berikut rekomendasi menu untuk Anda!',
      recommendations: filteredMenus.slice(0, 4).map(m => m.id),
      closing: 'Silakan pilih menu favorit Anda!',
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
