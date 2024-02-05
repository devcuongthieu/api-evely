import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const admin = await prisma.user.create({
      data: {
        first_name: 'Cương',
        last_name: 'Thiều',
        email: 'admin_evely@gmail.com',
        role: Role.ADMIN,
        password: 'admin@123',
      },
    });
    console.log('Admin user created:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
