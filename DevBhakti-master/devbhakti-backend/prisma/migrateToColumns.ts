const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Temple Column-Based Migration ---');

  const temples = await prisma.temple.findMany();
  console.log(`Found ${temples.length} temples to migrate.`);

  for (const temple of temples) {
    console.log(`Migrating: ${temple.id}...`);

    // Extract English text from the current Json fields
    const name_en = (temple.name && typeof temple.name === 'object') ? (temple.name as any).en : null;
    const location_en = (temple.location && typeof temple.location === 'object') ? (temple.location as any).en : null;
    const fullAddress_en = (temple.fullAddress && typeof temple.fullAddress === 'object') ? (temple.fullAddress as any).en : null;
    const description_en = (temple.description && typeof temple.description === 'object') ? (temple.description as any).en : null;
    const history_en = (temple.history && typeof temple.history === 'object') ? (temple.history as any).en : null;
    const category_en = (temple.category && typeof temple.category === 'object') ? (temple.category as any).en : null;
    const pickupLocation_en = (temple.pickupLocation && typeof temple.pickupLocation === 'object') ? (temple.pickupLocation as any).en : null;

    await prisma.temple.update({
      where: { id: temple.id },
      data: {
        name_en: name_en || '',
        location_en: location_en || '',
        fullAddress_en: fullAddress_en,
        description_en: description_en || '',
        history_en: history_en,
        category_en: category_en || '',
        pickupLocation_en: pickupLocation_en,
        // We set Hi and Mr to empty strings for now
        name_hi: "",
        name_mr: "",
        location_hi: "",
        location_mr: "",
        fullAddress_hi: "",
        fullAddress_mr: "",
        description_hi: "",
        description_mr: "",
        history_hi: "",
        history_mr: "",
        category_hi: "",
        category_mr: "",
        pickupLocation_hi: "",
        pickupLocation_mr: "",
      },
    });
  }

  console.log('--- Temple Column-Based Migration Completed ---');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
