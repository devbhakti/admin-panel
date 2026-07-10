import { PrismaClient } from './src/lib/prisma';
const prisma = new PrismaClient();

async function main() {
    const poojas = await prisma.pooja.findMany({ include: { templeCopies: true } });
    console.log(JSON.stringify(poojas.filter(p => p.isMaster).map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        masterImage: p.image,
        copies: p.templeCopies.map(c => ({ id: c.id, image: c.image }))
    })), null, 2));
}
main();
