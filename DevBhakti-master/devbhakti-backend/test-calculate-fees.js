const { PrismaClient } = require('@prisma/client');
const { getCommissionForAmount } = require('./src/controllers/admin/commissionSlabController');

const prisma = new PrismaClient();

async function testCalculateFees() {
  try {
    console.log('=== TESTING CALCULATE FEES API ===');
    
    // Get test data
    const globalSlabs = await prisma.commissionSlab.findMany({
      where: { slabType: 'GLOBAL', isActive: true }
    });
    
    const templeSlabs = await prisma.commissionSlab.findMany({
      where: { slabType: 'TEMPLE', isActive: true }
    });
    
    const products = await prisma.product.findMany({
      take: 3,
      select: { id: true, name: true, templeId: true, sellerId: true, price: true }
    });
    
    console.log('\nTEST DATA:');
    console.log('- Global slabs:', globalSlabs.length);
    console.log('- Temple slabs:', templeSlabs.length);
    console.log('- Products:', products.length);
    
    // Test commission calculation
    console.log('\n=== COMMISSION CALCULATION TESTS ===');
    
    for (const product of products) {
      console.log(`\nTesting: ${product.name}`);
      console.log(`- Price: ₹${product.price}`);
      console.log(`- Temple ID: ${product.templeId}`);
      console.log(`- Seller ID: ${product.sellerId}`);
      
      let vendorId = product.templeId || product.sellerId || "admin";
      let vendorType = product.templeId ? 'TEMPLE' : (product.sellerId ? 'SELLER' : 'GLOBAL');
      
      console.log(`- Vendor Type: ${vendorType}`);
      console.log(`- Vendor ID: ${vendorId}`);
      
      // Test commission calculation
      try {
        const commission = await getCommissionForAmount(
          product.price,
          vendorType,
          vendorId === "admin" ? null : vendorId,
          'MARKETPLACE'
        );
        
        console.log(`- Commission: ₹${commission.totalCommission} (Platform Fee: ₹${commission.platformFee} + ${commission.percentage}%)`);
        console.log(`- Using ${commission.slab ? 'specific slab' : 'no slab found'}`);
        
        if (commission.totalCommission === 0) {
          console.log('❌ ISSUE: Commission is 0!');
        } else {
          console.log('✅ Commission calculated correctly');
        }
        
      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
      }
    }
    
    // Test with sample cart data like frontend sends
    console.log('\n=== SAMPLE CART TEST ===');
    const sampleCart = [
      { productId: products[0]?.id, price: products[0]?.price || 500, quantity: 1, templeId: products[0]?.templeId },
      { productId: products[1]?.id, price: products[1]?.price || 300, quantity: 2, templeId: products[1]?.templeId }
    ];
    
    console.log('Sample cart:', sampleCart);
    
    // Group items by vendor (like calculateFees does)
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
    
    console.log('\nGrouped by vendor:');
    let totalPlatformFee = 0;
    
    for (const key in groups) {
      const group = groups[key];
      console.log(`- ${key}: ₹${group.amount} (${group.type})`);
      
      if (group.id === null) {
        console.log('  - Admin product: No commission');
        continue;
      }
      
      try {
        const commission = await getCommissionForAmount(
          group.amount,
          group.type,
          group.id,
          'MARKETPLACE'
        );
        
        totalPlatformFee += commission.totalCommission;
        console.log(`  - Commission: ₹${commission.totalCommission}`);
        
      } catch (error) {
        console.log(`  - ERROR: ${error.message}`);
      }
    }
    
    console.log(`\n💰 Total Platform Fee: ₹${totalPlatformFee}`);
    
    if (totalPlatformFee === 0) {
      console.log('❌ MAJOR ISSUE: Total platform fee is 0!');
    } else {
      console.log('✅ Platform fee calculated successfully');
    }
    
  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCalculateFees();
