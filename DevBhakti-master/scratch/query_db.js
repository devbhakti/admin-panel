const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const temples = await prisma.temple.findMany({
      include: {
        poojas: true,
        events: {
          include: {
            Pooja: true
          }
        }
      }
    });

    console.log("=== TEMPLES ===");
    for (const t of temples) {
      console.log(`Temple ID: ${t.id}, Slug: ${t.slug}, Name: ${JSON.stringify(t.name)}`);
      console.log(`  Active Poojas (status=true):`);
      t.poojas.filter(p => p.status === true).forEach(p => {
        console.log(`    Pooja: ${p.id}, Name: ${JSON.stringify(p.name)}, Status: ${p.status}`);
      });
      console.log(`  Inactive Poojas (status=false):`);
      t.poojas.filter(p => p.status === false).forEach(p => {
        console.log(`    Pooja: ${p.id}, Name: ${JSON.stringify(p.name)}, Status: ${p.status}`);
      });
      console.log(`  Events:`);
      t.events.forEach(e => {
        console.log(`    Event: ${e.id}, Name: ${JSON.stringify(e.name)}, Status: ${e.status}`);
        console.log(`      Linked Poojas:`);
        e.Pooja.forEach(p => {
          console.log(`        Pooja: ${p.id}, Name: ${JSON.stringify(p.name)}, Status: ${p.status}`);
        });
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
