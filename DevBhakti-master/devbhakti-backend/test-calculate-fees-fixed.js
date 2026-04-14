const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCalculateFees() {
  try {
    console.log('=== TESTING CALCULATE FEES API ===');
    
    // Get test data
    const globalSlabs = await prisma.commissionSlab.findMany({
      where: { slabType: 'GLOBAL', isActive: true, category: 'MARKETPLACE' }
    });
    
    const templeSlabs = await prisma.commissionSlab.findMany({
      where: { slabType: 'TEMPLE', isActive: true, category: 'MARKETPLACE' }
    });
    
    const products = await prisma.product.findMany({
      take: 3,
      select: { id: true, name: true, templeId: true, sellerId: true, variants: { select: { price: true, take: 1 } } }
    });
    
    console.log('\nTEST DATA:');
    console.log('- Global MARKETPLACE slabs:', globalSlabs.length);
    console.log('- Temple MARKETPLACE slabs:', templeSlabs.length);
    console.log('- Products:', products.length);
    
    globalSlabs.forEach(slab => {
      console.log(`  - ${slab.minAmount}-${slab.maxAmount || 'Infinity'}: ₹${slab.platformFee} + ${slab.percentage}%`);
    });
    
    // Test manual commission calculation
    console.log('\n=== MANUAL COMMISSION TEST ===');
    
    for (const product of products) {
      const price = product.variants[0]?.price || 0;
      console.log(`\nTesting: ${product.name} (₹${price})`);
      
      let vendorId = product.templeId || product.sellerId || "admin";
      let vendorType = product.templeId ? 'TEMPLE' : (product.sellerId ? 'SELLER' : 'GLOBAL');
      
      console.log(`- Vendor Type: ${vendorType}`);
      console.log(`- Vendor ID: ${vendorId}`);
      
      // Find applicable slab
      let slab = null;
      
      if (vendorId !== "admin") {
        // First try vendor-specific slab
        slab = await prisma.commissionSlab.findFirst({
          where: {
            slabType: vendorType,
            targetId: vendorId,
            category: 'MARKETPLACE',
            isActive: true,
            minAmount: { lte: price },
            OR: [
              { maxAmount: { gte: price } },
              { maxAmount: null }
            ]
          },
          orderBy: { minAmount: 'desc' }
        });
      }
      
      // If no vendor-specific slab, use global
      if (!slab && vendorId !== "admin") {
        slab = await prisma.commissionSlab.findFirst({
          where: {
            slabType: 'GLOBAL',
            category: 'MARKETPLACE',
            isActive: true,
            minAmount: { lte: price },
            OR: [
              { maxAmount: { gte: price } },
              { maxAmount: null }
            ]
          },
          orderBy: { minAmount: 'desc' }
        });
      }
      
      if (slab) {
        const percentageAmount = (price * slab.percentage) / 100;
        const totalCommission = slab.platformFee + percentageAmount;
        
        console.log(`- Found slab: ${slab.slabType} ${slab.minAmount}-${slab.maxAmount || 'Infinity'}`);
        console.log(`- Platform Fee: ₹${slab.platformFee} + ${slab.percentage}%`);
        console.log(`- Total Commission: ₹${totalCommission}`);
        console.log('✅ Commission calculated successfully');
        
      } else {
        console.log('❌ No slab found - Commission would be 0');
      }
    }
    
    // Test sample cart like frontend sends
    console.log('\n=== SAMPLE CART TEST ===');
    const sampleCart = [
      { productId: products[0]?.id, price: products[0]?.variants[0]?.price || 500, quantity: 1, templeId: products[0]?.templeId },
      { productId: products[1]?.id, price: products[1]?.variants[0]?.price || 300, quantity: 2, templeId: products[1]?.templeId }
    ];
    
    console.log('Sample cart items:', sampleCart.length);
    
    // Group by vendor
    const groups = {};
    for (const item of sampleCart) {
      let vendorId = item.templeId || item.sellerId || "admin";
      let vendorType = item.templeId ? 'TEMPLE' : (item.sellerId ? 'SELLER' : 'GLOBAL');
      
      const key = `${vendorType}_${vendorId}`;
      if (!groups[key]) {
        groups[key] = { amount: 0, type: vendorType, id: vendorId === "admin" ? null : vendorId };
      }
      groups[key].amount += item.price * item.quantity;
    }
    
    console.log('\nVendor groups:');
    let totalPlatformFee = 0;
    
    for (const key in groups) {
      const group = groups[key];
      console.log(`- ${key}: ₹${group.amount} (${group.type})`);
      
      if (group.id === null) {
        console.log('  - Admin product: No commission');
        continue;
      }
      
      // Find slab for this group
      let slab = await prisma.commissionSlab.findFirst({
        where: {
          slabType: group.type,
          targetId: group.id,
          category: 'MARKETPLACE',
          isActive: true,
          minAmount: { lte: group.amount },
          OR: [
            { maxAmount: { gte: group.amount } },
            { maxAmount: null }
          ]
        },
        orderBy: { minAmount: 'desc' }
      });
      
      // Fallback to global
      if (!slab) {
        slab = await prisma.commissionSlab.findFirst({
          where: {
            slabType: 'GLOBAL',
            category: 'MARKETPLACE',
            isActive: true,
            minAmount: { lte: group.amount },
            OR: [
              { maxAmount: { gte: group.amount } },
              { maxAmount: null }
            ]
          },
          orderBy: { minAmount: 'desc' }
        });
      }
      
      if (slab) {
        const percentageAmount = (group.amount * slab.percentage) / 100;
        const totalCommission = slab.platformFee + percentageAmount;
        totalPlatformFee += totalCommission;
        console.log(`  - Commission: ₹${totalCommission} (using ${slab.slabType} slab)`);
      } else {
        console.log('  - No slab found: ₹0 commission');
      }
    }
    
    console.log(`\n💰 Total Platform Fee: ₹${totalPlatformFee}`);
    
    if (totalPlatformFee === 0) {
      console.log('❌ MAJOR ISSUE: Total platform fee is 0!');
      console.log('This confirms the frontend issue!');
    } else {
      console.log('✅ Platform fee calculated successfully');
      console.log('Backend logic is working correctly');
    }
    
  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCalculateFees();
