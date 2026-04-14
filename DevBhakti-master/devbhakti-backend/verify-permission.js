const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPermission() {
  try {
    const perm = await prisma.permission.findUnique({
      where: { key: 'poojas.categories' }
    });
    
    console.log('✅ VERIFICATION:');
    console.log('- Permission:', perm.key);
    console.log('- ApplicableTo:', perm.applicableTo);
    console.log('- ADMIN access:', perm.applicableTo.includes('ADMIN'));
    console.log('- TEMPLE access:', perm.applicableTo.includes('TEMPLE'));
    console.log('- Issue FIXED:', perm.applicableTo.includes('TEMPLE') ? 'YES' : 'NO');
    
    if (perm.applicableTo.includes('TEMPLE')) {
      console.log('\n🎉 SUCCESS: Admin staff can now manage pooja categories!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPermission();
