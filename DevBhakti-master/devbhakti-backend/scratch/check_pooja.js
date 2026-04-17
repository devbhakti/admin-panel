const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPooja() {
  try {
    const id = 'cmo2k2sri000bvqpwuxk928p7';
    const pooja = await prisma.pooja.findFirst({
      where: {
        AND: [
          {
            OR: [
              { id: String(id) },
              { slug: String(id) }
            ]
          },
          {
            OR: [
              { isMaster: true },
              {
                temple: {
                  user: {
                    isVerified: true,
                    role: 'INSTITUTION'
                  }
                }
              }
            ]
          }
        ]
      }
    });

    if (!pooja) {
      console.log('POOJA_NOT_FOUND_WITH_VERIFICATION');
    } else {
      console.log('POOJA_FOUND_WITH_VERIFICATION');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkPooja();
