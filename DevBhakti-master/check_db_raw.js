const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { id: 'cmo8h5zk00003hu9b5ft8ca9j' },
        select: { name: true }
    });
    
    console.log("Raw user name from DB:");
    console.log(JSON.stringify(user.name));
    console.log("Type of user name:", typeof user.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
