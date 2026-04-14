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
    
    // Check TEMPLE slabs (without relation)
    const templeSlabs = await prisma.commissionSlab.findMany({
      where: { 
        slabType: 'TEMPLE',
        isActive: true 
      },
      orderBy: { minAmount: 'asc' }
    });
    
    console.log('\nTEMPLE SLABS:', templeSlabs.length);
    templeSlabs.forEach(slab => {
      console.log(`- Target ID: ${slab.targetId} | ${slab.category} ${slab.minAmount}-${slab.maxAmount || 'Infinity'} | Fee: ${slab.platformFee} + ${slab.percentage}%`);
    });
    
    // Check SELLER slabs (without relation)
    const sellerSlabs = await prisma.commissionSlab.findMany({
      where: { 
        slabType: 'SELLER',
        isActive: true 
      },
      orderBy: { minAmount: 'asc' }
    });
    
    console.log('\nSELLER SLABS:', sellerSlabs.length);
    sellerSlabs.forEach(slab => {
      console.log(`- Target ID: ${slab.targetId} | ${slab.category} ${slab.minAmount}-${slab.maxAmount || 'Infinity'} | Fee: ${slab.platformFee} + ${slab.percentage}%`);
    });
    
    // Check some products to see their temple/seller IDs
    const products = await prisma.product.findMany({
      take: 5,
      select: { 
        id: true, 
        name: true, 
        templeId: true, 
        sellerId: true
      }
    });
    
    console.log('\nPRODUCT SAMPLES:');
    products.forEach(product => {
      console.log(`- ${product.name}: Temple=${product.templeId} | Seller=${product.sellerId}`);
    });
    
    // Check if GLOBAL slabs exist for MARKETPLACE
    const marketplaceGlobalSlabs = globalSlabs.filter(s => s.category === 'MARKETPLACE');
    console.log('\nMARKETPLACE GLOBAL SLABS:', marketplaceGlobalSlabs.length);
    
    if (marketplaceGlobalSlabs.length === 0) {
      console.log('❌ ISSUE: No GLOBAL MARKETPLACE slabs found - this could cause ₹0 platform fee!');
    } else {
      console.log('✅ GLOBAL MARKETPLACE slabs exist');
      marketplaceGlobalSlabs.forEach(slab => {
        console.log(`  - ${slab.minAmount}-${slab.maxAmount || 'Infinity'}: ${slab.platformFee} + ${slab.percentage}%`);
      });
    }
    
    // Test commission calculation
    console.log('\n=== TESTING COMMISSION CALCULATION ===');
    if (products.length > 0 && marketplaceGlobalSlabs.length > 0) {
      const testProduct = products[0];
      const testAmount = 1000; // Test amount
      
      console.log(`Testing with: ${testProduct.name} (Amount: ${testAmount})`);
      
      if (testProduct.templeId) {
        console.log('- Vendor Type: TEMPLE');
        console.log('- Temple ID:', testProduct.templeId);
        
        // Check if temple has specific slabs
        const templeSpecificSlabs = templeSlabs.filter(s => s.targetId === testProduct.templeId && s.category === 'MARKETPLACE');
        console.log('- Temple-specific slabs:', templeSpecificSlabs.length);
        
        if (templeSpecificSlabs.length > 0) {
          console.log('- Will use TEMPLE-specific slabs');
        } else {
          console.log('- Will use GLOBAL slabs (fallback)');
        }
      } else if (testProduct.sellerId) {
        console.log('- Vendor Type: SELLER');
        console.log('- Seller ID:', testProduct.sellerId);
        
        const sellerSpecificSlabs = sellerSlabs.filter(s => s.targetId === testProduct.sellerId && s.category === 'MARKETPLACE');
        console.log('- Seller-specific slabs:', sellerSpecificSlabs.length);
        
        if (sellerSpecificSlabs.length > 0) {
          console.log('- Will use SELLER-specific slabs');
        } else {
          console.log('- Will use GLOBAL slabs (fallback)');
        }
      } else {
        console.log('- Vendor Type: ADMIN (no commission)');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCommissionSlabs();
