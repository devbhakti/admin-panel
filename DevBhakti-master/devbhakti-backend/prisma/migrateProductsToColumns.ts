const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Products/Other Models Column Migration ---');

  // 1. Feature
  const features = await prisma.feature.findMany();
  console.log(`Migrating ${features.length} features...`);
  for (const f of features) {
    await prisma.feature.update({
      where: { id: f.id },
      data: { title_en: f.title, description_en: f.description }
    });
  }

  // 2. Testimonial
  const testimonials = await prisma.testimonial.findMany();
  console.log(`Migrating ${testimonials.length} testimonials...`);
  for (const t of testimonials) {
    await prisma.testimonial.update({
      where: { id: t.id },
      data: { title_en: t.title, subtitle_en: t.subtitle, category_en: t.category }
    });
  }

  // 3. ProductCategory
  const pCategories = await prisma.productCategory.findMany();
  console.log(`Migrating ${pCategories.length} product categories...`);
  for (const pc of pCategories) {
    await prisma.productCategory.update({
      where: { id: pc.id },
      data: { name_en: pc.name, description_en: pc.description }
    });
  }

  // 4. Product
  const products = await prisma.product.findMany();
  console.log(`Migrating ${products.length} products...`);
  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { 
        name_en: p.name, 
        description_en: p.description, 
        category_en: p.category,
        highlights_en: p.highlights,
        longDescription_en: p.longDescription,
        shippingInfo_en: p.shippingInfo,
        origin_en: p.origin
      }
    });
  }

  // 5. ProductVariant
  const variants = await prisma.productVariant.findMany();
  console.log(`Migrating ${variants.length} variants...`);
  for (const v of variants) {
    await prisma.productVariant.update({
      where: { id: v.id },
      data: { name_en: v.name }
    });
  }

  console.log('--- Products/Other Models Column Migration Completed ---');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
