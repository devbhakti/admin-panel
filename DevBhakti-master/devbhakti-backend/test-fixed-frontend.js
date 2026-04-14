const axios = require('axios');

async function testFixedFrontend() {
  try {
    console.log('=== TESTING FIXED FRONTEND API ===');
    
    const API_URL = 'http://localhost:5000';
    
    // Test with the same data that frontend would send
    console.log('\nTesting with corrected API path...');
    
    const sampleCart = [
      { 
        productId: 'test-product-1', 
        price: 500, 
        quantity: 1, 
        templeId: 'cmnsospsm000wvqfodch2j45a'
      },
      { 
        productId: 'test-product-2', 
        price: 300, 
        quantity: 2, 
        sellerId: 'cmnww9gss0016vqycw1skahmw'
      }
    ];
    
    try {
      const response = await axios.post(`${API_URL}/api/orders/calculate-fees`, {
        items: sampleCart
      });
      
      console.log('✅ FIXED API Response:');
      console.log('- Status:', response.status);
      console.log('- Success:', response.data.success);
      console.log('- Total Platform Fee:', response.data.totalPlatformFee);
      console.log('- Vendor Breakdown:', response.data.vendorBreakdown);
      
      if (response.data.totalPlatformFee > 0) {
        console.log('🎉 SUCCESS: Platform fee is now calculated!');
        console.log('Frontend fix is working correctly');
      } else {
        console.log('⚠️ Platform fee is still 0');
      }
      
      // Test individual vendor breakdown
      response.data.vendorBreakdown.forEach((vendor, index) => {
        console.log(`\nVendor ${index + 1}:`);
        console.log(`- ID: ${vendor.vendorId}`);
        console.log(`- Type: ${vendor.vendorType}`);
        console.log(`- Amount: ₹${vendor.amount}`);
        console.log(`- Fee: ₹${vendor.fee} (Fixed: ₹${vendor.fixedFee} + ${vendor.percentage}%)`);
      });
      
    } catch (error) {
      console.log('❌ API Error:', error.response?.data?.message || error.message);
      console.log('Status:', error.response?.status);
    }
    
    // Test with temple-only cart
    console.log('\n=== TEMPLE-ONLY CART TEST ===');
    
    const templeCart = [
      { productId: 'temple-product', price: 1000, quantity: 1, templeId: 'cmnsospsm000wvqfodch2j45a' }
    ];
    
    try {
      const templeResponse = await axios.post(`${API_URL}/api/orders/calculate-fees`, {
        items: templeCart
      });
      
      console.log('Temple Cart Result:');
      console.log('- Platform Fee:', templeResponse.data.totalPlatformFee);
      console.log('- Expected: ₹110 (using temple-specific slab)');
      
      if (templeResponse.data.totalPlatformFee === 110) {
        console.log('✅ Temple-specific slab applied correctly');
      } else {
        console.log('⚠️ Unexpected fee amount');
      }
      
    } catch (error) {
      console.log('Temple cart error:', error.message);
    }
    
    // Test with seller-only cart
    console.log('\n=== SELLER-ONLY CART TEST ===');
    
    const sellerCart = [
      { productId: 'seller-product', price: 800, quantity: 1, sellerId: 'cmnww9gss0016vqycw1skahmw' }
    ];
    
    try {
      const sellerResponse = await axios.post(`${API_URL}/api/orders/calculate-fees`, {
        items: sellerCart
      });
      
      console.log('Seller Cart Result:');
      console.log('- Platform Fee:', sellerResponse.data.totalPlatformFee);
      console.log('- Expected: ₹92 (using seller-specific slab)');
      
      if (sellerResponse.data.totalPlatformFee === 92) {
        console.log('✅ Seller-specific slab applied correctly');
      } else {
        console.log('⚠️ Unexpected fee amount');
      }
      
    } catch (error) {
      console.log('Seller cart error:', error.message);
    }
    
    // Test with admin product (should be 0)
    console.log('\n=== ADMIN PRODUCT TEST ===');
    
    const adminCart = [
      { productId: 'admin-product', price: 600, quantity: 1 }  // No templeId or sellerId
    ];
    
    try {
      const adminResponse = await axios.post(`${API_URL}/api/orders/calculate-fees`, {
        items: adminCart
      });
      
      console.log('Admin Cart Result:');
      console.log('- Platform Fee:', adminResponse.data.totalPlatformFee);
      console.log('- Expected: ₹0 (admin products have no commission)');
      
      if (adminResponse.data.totalPlatformFee === 0) {
        console.log('✅ Admin product correctly has 0 commission');
      } else {
        console.log('⚠️ Admin product should have 0 commission');
      }
      
    } catch (error) {
      console.log('Admin cart error:', error.message);
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('Frontend API path has been fixed from /orders/calculate-fees to /api/orders/calculate-fees');
    console.log('Platform fees should now calculate correctly in the frontend checkout page');
    
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testFixedFrontend();
