import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing findUnique with composite email_role key...');
    // We try to find an ADMIN with some email. 
    // Even if it doesn't exist, Prisma shouldn't throw a validation error now.
    const user = await prisma.user.findUnique({
      where: { 
        email_role: {
          email: 'admin@devbhakti.in',
          role: 'ADMIN'
        }
      },
    });
    console.log('Result (expected null or user):', user);
    console.log('SUCCESS: No validation error thrown.');
  } catch (error) {
    console.error('FAILED: Error encountered:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
