const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCommissionSlabs() {
  try {
    console.log('=== CHECKING COMMISSION SLABS ===');
    
    // Check GLOBAL slabs
    const globalSlabs = await prisma.commissionSlab.findMany({
      where: { 
        slabType: 'GLOBAL',
        isActive: true 
      },
      orderBy: { minAmount: 'asc' }
    });
    
    console.log('\nGLOBAL SLABS:', globalSlabs.length);
    globalSlabs.forEach(slab => {
      console.log(`- ${slab.category}: ${slab.minAmount}-${slab.maxAmount || 'Infinity'} | Fee: ${slab.platformFee} + ${slab.percentage}%`);
    });
    
    // Check TEMPLE slabs
    const templeSlabs = await prisma.commissionSlab.findMany({
      where: { 
        slabType: 'TEMPLE',
        isActive: true 
      },
      include: { temple: { select: { name: true } } }
    });
    
    console.log('\nTEMPLE SLABS:', templeSlabs.length);
    templeSlabs.forEach(slab => {
      console.log(`- ${slab.temple?.name || 'Unknown'} (${slab.targetId}): ${slab.category} ${slab.minAmount}-${slab.maxAmount || 'Infinity'} | Fee: ${slab.platformFee} + ${slab.percentage}%`);
    });
    
    // Check SELLER slabs
    const sellerSlabs = await prisma.commissionSlab.findMany({
      where: { 
        slabType: 'SELLER',
        isActive: true 
      },
      include: { seller: { select: { name: true } } }
    });
    
    console.log('\nSELLER SLABS:', sellerSlabs.length);
    sellerSlabs.forEach(slab => {
      console.log(`- ${slab.seller?.name || 'Unknown'} (${slab.targetId}): ${slab.category} ${slab.minAmount}-${slab.maxAmount || 'Infinity'} | Fee: ${slab.platformFee} + ${slab.percentage}%`);
    });
    
    // Check some products to see their temple/seller IDs
    const products = await prisma.product.findMany({
      take: 5,
      select: { 
        id: true, 
        name: true, 
        templeId: true, 
        sellerId: true,
        temple: { select: { name: true } },
        seller: { select: { name: true } }
      }
    });
    
    console.log('\nPRODUCT SAMPLES:');
    products.forEach(product => {
      console.log(`- ${product.name}: Temple=${product.templeId} (${product.temple?.name}) | Seller=${product.sellerId} (${product.seller?.name})`);
    });
    
    // Check if GLOBAL slabs exist for MARKETPLACE
    const marketplaceGlobalSlabs = globalSlabs.filter(s => s.category === 'MARKETPLACE');
    console.log('\nMARKETPLACE GLOBAL SLABS:', marketplaceGlobalSlabs.length);
    
    if (marketplaceGlobalSlabs.length === 0) {
      console.log('❌ ISSUE: No GLOBAL MARKETPLACE slabs found - this could cause ₹0 platform fee!');
    } else {
      console.log('✅ GLOBAL MARKETPLACE slabs exist');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCommissionSlabs();
