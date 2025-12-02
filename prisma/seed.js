import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

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
  console.log('✅ Admin user created:', { id: admin.id, username: admin.username, role: admin.role });

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
  console.log('✅ Kasir user created:', { id: kasir.id, username: kasir.username, role: kasir.role });
  
  const kokiPassword = await bcrypt.hash('koki123', 10);
  const koki = await prisma.user.upsert({
    where: { username: 'koki' },
    update: {},
    create: {
      username: 'koki',
      password: kokiPassword,
      role: 'KOKI',
    },
  });
  console.log('✅ Koki user created:', { id: koki.id, username: koki.username, role: koki.role });
  
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
