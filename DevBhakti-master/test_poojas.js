const { PrismaClient } = require('./devbhakti-backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const temple = await prisma.temple.findFirst({
    where: { name: { path: ['en'], string_contains: 'Mulvir' } },
    select: { id: true, name: true, isActive: true, user: { select: { isVerified: true, role: true } } }
  });
  console.log('Temple:', temple);

  if (temple) {
    const poojas = await prisma.pooja.findMany({
      where: { templeId: temple.id, status: true }
    });
    console.log(`Poojas for ${temple.id} (Direct):`, poojas.length);

    // getAllPoojas logic
    const where = {
      status: true,
      templeId: temple.id,
      temple: {
        isActive: true,
        user: { isVerified: true }
      }
    };
    const poojas2 = await prisma.pooja.findMany({ where });
    console.log(`Poojas for ${temple.id} (getAllPoojas logic):`, poojas2.length);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
