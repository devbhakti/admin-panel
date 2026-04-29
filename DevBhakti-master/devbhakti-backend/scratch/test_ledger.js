const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        // Find a seller first
        const seller = await prisma.sellerProfile.findFirst();
        if (!seller) {
            console.log("No seller found");
            return;
        }
        const sellerId = seller.id;
        console.log("Testing with sellerId:", sellerId);

        const entries = await prisma.templeLedger.findMany({
            where: { sellerId },
            orderBy: { createdAt: "desc" }
        });
        console.log("Ledger entries count:", entries.length);

        const orderIds = entries
            .filter(e => e.type === "MARKETPLACE_EARNING" && e.sourceId)
            .map(e => e.sourceId);

        console.log("Order IDs count:", orderIds.length);

        if (orderIds.length > 0) {
            const orders = await prisma.order.findMany({
                where: { id: { in: orderIds } },
                include: {
                    user: { select: { name: true } },
                    subOrders: {
                        where: { sellerId: sellerId },
                        select: { status: true, id: true, displayId: true }
                    }
                }
            });
            console.log("Orders found:", orders.length);
        }
        console.log("Test passed!");
    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
