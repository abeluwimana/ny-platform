// backend/create-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 Checking for existing admin...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'nyentertainmentrwanda@gmail.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('🔑 Password: Admin@123 (if using default)');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'nyentertainmentrwanda@gmail.com',
        password: hashedPassword,
        name: 'NY Admin',
        phone: '+250 780 145 562',
        role: 'ADMIN',
        isActive: true,
        adminProfile: {
          create: {
            permissions: 'ALL',
            department: 'Administration'
          }
        }
      }
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Role:', admin.role);
    console.log('🔑 Password: Admin@123');
    console.log('📱 Phone:', admin.phone);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    console.error('Details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdmin();