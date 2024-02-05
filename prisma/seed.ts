import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  try {
    const admin = await prisma.user.create({
      data: {
        first_name: 'Cương',
        last_name: 'Thiều',
        email: 'admin_evely@gmail.com',
        role: Role.ADMIN,
        password: await argon2.hash('admin@123'),
      },
    });
    console.log('Admin created:', admin);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
