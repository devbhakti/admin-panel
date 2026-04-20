const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
        OR: [
            { id: 'cmo2nqlny000avqfczuwzco8m' },
            { id: 'cmo3ulz1r0009vqlw447mqx77' }
        ]
    },
    include: {
      temple: true
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
