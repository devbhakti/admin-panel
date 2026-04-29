const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugLedger() {
    try {
        const ledger = await prisma.templeLedger.findMany({
            where: { type: "MARKETPLACE_EARNING" },
            take: 5
        });
        console.log("Ledger Samples:", JSON.stringify(ledger, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

debugLedger();
