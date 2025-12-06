import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', { id: admin.id, username: admin.username, role: admin.role });

  // Create sample kasir user
  const kasirPassword = await bcrypt.hash('kasir123', 10);
  const kasir = await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      username: 'kasir',
      password: kasirPassword,
      role: 'KASIR',
    },
  });
  console.log('Kasir user created:', { id: kasir.id, username: kasir.username, role: kasir.role });

  // Delete existing data
  console.log('Clearing existing menu and category data...');
  await prisma.menu.deleteMany({});
  await prisma.category.deleteMany({});

  // Create categories with menus
  const categories = [
    {
      name: 'Nasi Goreng',
      description: 'Berbagai varian nasi goreng spesial',
      icon: '🍳',
      order: 1,
      menus: [
        { name: 'Nasi Goreng Ayam', price: 18000, description: 'Nasi goreng dengan potongan ayam suwir' },
        { name: 'Nasi Goreng Telur', price: 15000, description: 'Nasi goreng dengan telur ceplok' },
        { name: 'Nasi Goreng Spesial', price: 22000, description: 'Nasi goreng lengkap dengan ayam, telur, dan udang' },
        { name: 'Nasi Goreng Seafood', price: 25000, description: 'Nasi goreng dengan seafood segar' },
      ],
    },
    {
      name: 'Ayam',
      description: 'Menu olahan ayam pilihan',
      icon: '🍗',
      order: 2,
      menus: [
        { name: 'Nasi Ayam Geprek', price: 20000, description: 'Ayam goreng geprek dengan sambal level' },
        { name: 'Nasi Ayam Bakar', price: 22000, description: 'Ayam bakar bumbu kecap manis' },
        { name: 'Nasi Ayam Goreng', price: 18000, description: 'Ayam goreng crispy dengan nasi hangat' },
        { name: 'Nasi Ayam Penyet', price: 19000, description: 'Ayam goreng penyet dengan sambal terasi' },
      ],
    },
    {
      name: 'Mie',
      description: 'Aneka menu mie favorit',
      icon: '🍜',
      order: 3,
      menus: [
        { name: 'Mie Goreng', price: 15000, description: 'Mie goreng spesial dengan sayuran' },
        { name: 'Mie Ayam', price: 16000, description: 'Mie ayam dengan topping ayam suwir' },
        { name: 'Mie Goreng Seafood', price: 20000, description: 'Mie goreng dengan seafood' },
        { name: 'Mie Kuah Spesial', price: 17000, description: 'Mie kuah dengan bakso dan pangsit' },
      ],
    },
    {
      name: 'Soto & Sop',
      description: 'Hidangan berkuah hangat',
      icon: '🍲',
      order: 4,
      menus: [
        { name: 'Soto Ayam', price: 18000, description: 'Soto ayam kuning dengan lontong' },
        { name: 'Soto Betawi', price: 20000, description: 'Soto khas Betawi dengan santan' },
        { name: 'Sop Buntut', price: 35000, description: 'Sop buntut sapi dengan kuah gurih' },
        { name: 'Sop Ayam', price: 16000, description: 'Sop ayam dengan sayuran segar' },
      ],
    },
    {
      name: 'Seafood',
      description: 'Menu seafood segar',
      icon: '🦐',
      order: 5,
      menus: [
        { name: 'Udang Goreng Mentega', price: 40000, description: 'Udang goreng dengan saus mentega' },
        { name: 'Cumi Goreng Tepung', price: 35000, description: 'Cumi crispy dengan saus sambal' },
        { name: 'Ikan Bakar', price: 38000, description: 'Ikan bakar bumbu kecap' },
        { name: 'Nasi Goreng Udang', price: 28000, description: 'Nasi goreng dengan udang besar' },
      ],
    },
    {
      name: 'Nasi Campur',
      description: 'Nasi dengan lauk beragam',
      icon: '🍱',
      order: 6,
      menus: [
        { name: 'Nasi Campur Komplit', price: 25000, description: 'Nasi dengan berbagai lauk pilihan' },
        { name: 'Nasi Rames', price: 22000, description: 'Nasi dengan lauk sayur dan protein' },
        { name: 'Nasi Gudeg', price: 20000, description: 'Nasi gudeg khas Yogyakarta' },
        { name: 'Nasi Rawon', price: 23000, description: 'Nasi rawon daging sapi' },
      ],
    },
    {
      name: 'Snack & Gorengan',
      description: 'Camilan dan gorengan',
      icon: '🍟',
      order: 7,
      menus: [
        { name: 'Pisang Goreng', price: 10000, description: 'Pisang goreng crispy' },
        { name: 'Tahu Isi', price: 12000, description: 'Tahu isi sayuran goreng' },
        { name: 'Tempe Mendoan', price: 8000, description: 'Tempe mendoan khas Purwokerto' },
        { name: 'French Fries', price: 15000, description: 'Kentang goreng crispy' },
      ],
    },
    {
      name: 'Minuman Dingin',
      description: 'Minuman segar dingin',
      icon: '🧊',
      order: 8,
      menus: [
        { name: 'Es Teh Manis', price: 5000, description: 'Teh manis dingin segar' },
        { name: 'Es Jeruk', price: 8000, description: 'Jus jeruk segar dengan es' },
        { name: 'Es Lemon Tea', price: 10000, description: 'Teh lemon dingin menyegarkan' },
        { name: 'Es Cappuccino', price: 15000, description: 'Cappuccino dingin creamy' },
      ],
    },
    {
      name: 'Minuman Panas',
      description: 'Minuman hangat nikmat',
      icon: '☕',
      order: 9,
      menus: [
        { name: 'Teh Panas', price: 4000, description: 'Teh hangat manis' },
        { name: 'Kopi Hitam', price: 8000, description: 'Kopi hitam original' },
        { name: 'Kopi Susu', price: 12000, description: 'Kopi susu creamy' },
        { name: 'Cappuccino', price: 15000, description: 'Cappuccino panas dengan foam' },
      ],
    },
    {
      name: 'Jus & Smoothie',
      description: 'Jus buah segar',
      icon: '🥤',
      order: 10,
      menus: [
        { name: 'Jus Alpukat', price: 15000, description: 'Jus alpukat segar creamy' },
        { name: 'Jus Mangga', price: 14000, description: 'Jus mangga manis segar' },
        { name: 'Jus Strawberry', price: 16000, description: 'Jus strawberry segar' },
        { name: 'Smoothie Bowl', price: 25000, description: 'Smoothie bowl dengan topping buah' },
      ],
    },
    {
      name: 'Dessert',
      description: 'Penutup manis',
      icon: '🍰',
      order: 11,
      menus: [
        { name: 'Es Krim Coklat', price: 12000, description: 'Es krim coklat premium' },
        { name: 'Brownies', price: 15000, description: 'Brownies coklat lembut' },
        { name: 'Pudding', price: 10000, description: 'Pudding caramel lembut' },
        { name: 'Pancake', price: 20000, description: 'Pancake dengan sirup maple' },
      ],
    },
    {
      name: 'Paket Hemat',
      description: 'Paket makanan hemat',
      icon: '💰',
      order: 12,
      menus: [
        { name: 'Paket Ayam + Minum', price: 22000, description: 'Nasi ayam goreng + es teh' },
        { name: 'Paket Nasi Goreng + Minum', price: 20000, description: 'Nasi goreng + es jeruk' },
        { name: 'Paket Mie Ayam + Minum', price: 18000, description: 'Mie ayam + teh panas' },
        { name: 'Paket Keluarga', price: 85000, description: 'Paket untuk 4 orang dengan lauk lengkap' },
      ],
    },
  ];

  console.log('Creating categories and menus...');
  
  for (const cat of categories) {
    const { menus, ...categoryData } = cat;
    
    const category = await prisma.category.create({
      data: {
        ...categoryData,
        menus: {
          create: menus,
        },
      },
      include: {
        menus: true,
      },
    });
    
    console.log(`Created category: ${category.name} with ${category.menus.length} menus`);
  }

  const totalCategories = await prisma.category.count();
  const totalMenus = await prisma.menu.count();
  
  console.log(`\nSummary:`);
  console.log(`   - Total Categories: ${totalCategories}`);
  console.log(`   - Total Menus: ${totalMenus}`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
