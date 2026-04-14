const axios = require('axios');

async function testFinalFix() {
  try {
    console.log('=== TESTING FINAL FIX ===');
    
    // Test the exact URL that frontend should be using now
    const API_URL = 'http://localhost:3000/api';
    const finalUrl = `${API_URL}/orders/calculate-fees`;
    
    console.log('Final URL:', finalUrl);
    console.log('Expected URL: http://localhost:3000/api/orders/calculate-fees');
    
    try {
      const response = await axios.post(finalUrl, {
        items: [
          { productId: 'test', price: 100, quantity: 1, templeId: 'cmnsospsm000wvqfodch2j45a' }
        ]
      });
      
      console.log('✅ SUCCESS!');
      console.log('- Status:', response.status);
      console.log('- Platform Fee:', response.data.totalPlatformFee);
      console.log('- Vendor Breakdown:', response.data.vendorBreakdown);
      
      if (response.data.totalPlatformFee > 0) {
        console.log('🎉 PLATFORM FEE IS WORKING!');
      } else {
        console.log('⚠️ Platform fee is still 0');
      }
      
    } catch (error) {
      console.log('❌ ERROR:', error.response?.status);
      console.log('- Message:', error.response?.data || error.message);
      
      if (error.response?.data?.includes('/api/api/')) {
        console.log('🔥 DOUBLE /api PREFIX STILL EXISTS!');
      }
    }
    
    // Test wrong URL to show the difference
    console.log('\n=== TESTING WRONG URL (for comparison) ===');
    
    const wrongUrl = `${API_URL}/api/orders/calculate-fees`;
    console.log('Wrong URL:', wrongUrl);
    
    try {
      const wrongResponse = await axios.post(wrongUrl, {
        items: [{ productId: 'test', price: 100, quantity: 1, templeId: 'cmnsospsm000wvqfodch2j45a' }]
      });
      console.log('❌ UNEXPECTED: Wrong URL worked');
    } catch (error) {
      console.log('✅ EXPECTED: Wrong URL failed with', error.response?.status);
      console.log('- Error:', error.response?.data?.slice(0, 100) + '...');
    }
    
    console.log('\n=== INSTRUCTIONS ===');
    console.log('1. Clear browser cache (Ctrl+Shift+R)');
    console.log('2. Open checkout page: http://localhost:3000/marketplace/checkout');
    console.log('3. Check console logs for:');
    console.log('   - 🛒 Cart Items: [count]');
    console.log('   - 🔗 API_URL: http://localhost:3000/api');
    console.log('   - 📤 Sending request: {items: [...]}');
    console.log('   - 📥 API Response: {success: true, totalPlatformFee: X}');
    console.log('   - ✅ Platform fee set to: X');
    
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testFinalFix();
