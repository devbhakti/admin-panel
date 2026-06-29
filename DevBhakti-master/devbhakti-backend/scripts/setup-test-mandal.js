const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const phone = '+919399805327';
    let u = await prisma.user.findFirst({ where: { phone, role: 'MANDAL' } });
    if (!u) {
        console.log('Creating Test Mandal User...');
        u = await prisma.user.create({
            data: {
                displayId: 'MNID-TEST',
                phone: phone,
                role: 'MANDAL',
                isVerified: true,
                isActive: true,
                name: 'Test Mandal'
            }
        });
        
        console.log('Creating Test Mandal Profile...');
        const m = await prisma.mandal.create({
            data: {
                userId: u.id,
                status: 'APPROVED',
                name: JSON.stringify({ en: 'Test Mandal', hi: 'टेस्ट मंडल', mr: 'टेस्ट मंडळ' }),
                contactNumber: phone
            }
        });
        console.log('Created!', { user: u, mandal: m });
    } else {
        console.log('Mandal User already exists.');
        const m = await prisma.mandal.findUnique({ where: { userId: u.id } });
        if (!m) {
             const newM = await prisma.mandal.create({
                 data: {
                     userId: u.id,
                     status: 'APPROVED',
                     name: JSON.stringify({ en: 'Test Mandal', hi: 'टेस्ट मंडल', mr: 'टेस्ट मंडळ' }),
                     contactNumber: phone
                 }
             });
             console.log('Created missing Mandal profile:', newM);
        } else {
             console.log('Mandal Profile:', m);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
