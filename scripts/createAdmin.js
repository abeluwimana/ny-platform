const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@nyentertainment.com';
    const password = 'Admin123!';
    const name = 'Super Admin';
    
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('⚠️  User already exists');
      
      // Update to admin if exists but not admin
      if (existing.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        });
        console.log('✅ User updated to ADMIN role');
      } else {
        console.log('✅ User is already an ADMIN');
      }
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: '+250 780 000 000',
        role: 'ADMIN',
        isActive: true,
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();