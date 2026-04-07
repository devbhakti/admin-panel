const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Pooja Column-Based Migration ---');

  const poojas = await prisma.pooja.findMany();
  console.log(`Found ${poojas.length} poojas to migrate.`);

  for (const pooja of poojas) {
    console.log(`Migrating: ${pooja.id}...`);

    await prisma.pooja.update({
      where: { id: pooja.id },
      data: {
        name_en: pooja.name || '',
        name_hi: '',
        name_mr: '',
        category_en: pooja.category || '',
        category_hi: '',
        category_mr: '',
        duration_en: pooja.duration || '',
        duration_hi: '',
        duration_mr: '',
        description_en: pooja.description || [],
        description_hi: [],
        description_mr: [],
        about_en: pooja.about,
        about_hi: '',
        about_mr: '',
        benefits_en: pooja.benefits || [],
        benefits_hi: [],
        benefits_mr: [],
        bullets_en: pooja.bullets || [],
        bullets_hi: [],
        bullets_mr: [],
        process_en: pooja.process,
        process_hi: '',
        process_mr: '',
        templeDetails_en: pooja.templeDetails,
        templeDetails_hi: '',
        templeDetails_mr: '',
      },
    });
  }

  console.log('--- Pooja Column-Based Migration Completed ---');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
