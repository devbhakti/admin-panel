const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Mandal" CASCADE');
    console.log('✅ Mandal table dropped successfully');
}

main()
    .catch(e => { console.error('❌ Error:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
