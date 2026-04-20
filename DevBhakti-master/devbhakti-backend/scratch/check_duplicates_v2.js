const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      phone: {
        contains: '9977132450'
      }
    }
  });
  console.log('Users found with phone containing 9977132450:', users.length);
  users.forEach(u => {
    console.log(`ID: ${u.id}, Phone: ${u.phone}, Role: ${u.role}, Email: ${u.email}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
