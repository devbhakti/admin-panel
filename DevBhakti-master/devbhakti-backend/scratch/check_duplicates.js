const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { phone: '+919977132450' },
        { email: 'admin@kashivishwanath.org' }
      ]
    },
    include: {
      temple: true
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
