const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nyentertainment.com' },
    update: {},
    create: {
      email: 'admin@nyentertainment.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '0780000000',
      role: 'ADMIN',
      isActive: true,
      adminProfile: {
        create: {
          department: 'Management',
          permissions: { all: true }
        }
      }
    }
  });
  
  console.log('✅ Admin created:', admin.email);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });