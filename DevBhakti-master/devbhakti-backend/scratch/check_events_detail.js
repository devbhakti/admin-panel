const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(events, null, 2));
}

main();
