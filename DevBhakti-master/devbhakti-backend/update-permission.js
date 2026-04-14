const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePermission() {
  try {
    console.log('Updating poojas.categories permission...');
    
    const updated = await prisma.permission.update({
      where: { key: 'poojas.categories' },
      data: { 
        applicableTo: ['ADMIN', 'TEMPLE']
      }
    });
    
    console.log('✅ Permission updated successfully!');
    console.log('- Key:', updated.key);
    console.log('- New ApplicableTo:', updated.applicableTo);
    console.log('- Admin staff can now manage pooja categories!');
    
  } catch (error) {
    console.error('❌ Error updating permission:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePermission();
