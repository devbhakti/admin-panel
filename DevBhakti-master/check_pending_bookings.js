const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const pendingCount = await prisma.poojaBooking.count({
        where: { status: 'PENDING' }
    });
    
    console.log("Number of PENDING pooja bookings:", pendingCount);
    
    if (pendingCount > 0) {
        const sample = await prisma.poojaBooking.findMany({
            where: { status: 'PENDING' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                displayId: true,
                devoteeName: true,
                createdAt: true
            }
        });
        console.log("Recent pending bookings:", JSON.stringify(sample, null, 2));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
