const axios = require('axios');

async function testFrontendAPI() {
  try {
    console.log('=== TESTING FRONTEND API CALLS ===');
    
    const API_URL = 'http://localhost:5000';
    
    // Test 1: Calculate fees with sample cart data
    console.log('\n1. Testing calculate-fees API...');
    
    const sampleCart = [
      { 
        productId: 'test-product-1', 
        price: 500, 
        quantity: 1, 
        templeId: 'cmnsospsm000wvqfodch2j45a'  // Temple with specific slabs
      },
      { 
        productId: 'test-product-2', 
        price: 300, 
        quantity: 2, 
        sellerId: 'cmnww9gss0016vqycw1skahmw'  // Seller with specific slabs
      }
    ];
    
    try {
      const response = await axios.post(`${API_URL}/api/orders/calculate-fees`, {
        items: sampleCart
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ API Response:');
      console.log('- Status:', response.status);
      console.log('- Success:', response.data.success);
      console.log('- Total Platform Fee:', response.data.totalPlatformFee);
      console.log('- Vendor Breakdown:', response.data.vendorBreakdown);
      
      if (response.data.totalPlatformFee === 0) {
        console.log('❌ ISSUE: Platform fee is 0!');
      } else {
        console.log('✅ Platform fee calculated successfully');
      }
      
    } catch (error) {
      console.log('❌ API Error:');
      console.log('- Status:', error.response?.status);
      console.log('- Message:', error.response?.data?.message || error.message);
      console.log('- Data:', error.response?.data);
    }
    
    // Test 2: Check if API endpoint exists and is accessible
    console.log('\n2. Testing API endpoint accessibility...');
    
    try {
      const healthCheck = await axios.get(`${API_URL}/health`, {
        timeout: 5000
      });
      console.log('✅ Server is running');
    } catch (error) {
      console.log('⚠️ Health check failed, but server might be running');
    }
    
    // Test 3: Test with different vendor combinations
    console.log('\n3. Testing different vendor combinations...');
    
    const testCases = [
      {
        name: 'Temple Product Only',
        items: [{ productId: 'test-1', price: 1000, quantity: 1, templeId: 'cmnsospsm000wvqfodch2j45a' }]
      },
      {
        name: 'Seller Product Only',
        items: [{ productId: 'test-2', price: 800, quantity: 1, sellerId: 'cmnww9gss0016vqycw1skahmw' }]
      },
      {
        name: 'Mixed Cart',
        items: [
          { productId: 'test-1', price: 500, quantity: 1, templeId: 'cmnsospsm000wvqfodch2j45a' },
          { productId: 'test-2', price: 400, quantity: 1, sellerId: 'cmnww9gss0016vqycw1skahmw' }
        ]
      },
      {
        name: 'Admin Product Only',
        items: [{ productId: 'test-3', price: 600, quantity: 1 }]  // No templeId or sellerId
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name}`);
      
      try {
        const response = await axios.post(`${API_URL}/api/orders/calculate-fees`, {
          items: testCase.items
        });
        
        console.log(`- Platform Fee: ₹${response.data.totalPlatformFee}`);
        console.log(`- Success: ${response.data.success}`);
        
        if (response.data.vendorBreakdown) {
          response.data.vendorBreakdown.forEach((vendor, index) => {
            console.log(`  - Vendor ${index + 1}: ₹${vendor.fee} (${vendor.vendorType})`);
          });
        }
        
      } catch (error) {
        console.log(`- Error: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Test 4: Check API response format
    console.log('\n4. Checking API response format...');
    
    try {
      const response = await axios.post(`${API_URL}/api/orders/calculate-fees`, {
        items: [{ productId: 'test', price: 100, quantity: 1, templeId: 'cmnsospsm000wvqfodch2j45a' }]
      });
      
      console.log('Response structure:');
      console.log('- Has success field:', 'success' in response.data);
      console.log('- Has totalPlatformFee field:', 'totalPlatformFee' in response.data);
      console.log('- Has vendorBreakdown field:', 'vendorBreakdown' in response.data);
      console.log('- Response keys:', Object.keys(response.data));
      
    } catch (error) {
      console.log('Error checking response format:', error.message);
    }
    
    // Test 5: Test with real product IDs from database
    console.log('\n5. Testing with real product data...');
    
    try {
      // Get real products
      const productsResponse = await axios.get(`${API_URL}/api/products?limit=2`);
      
      if (productsResponse.data.success && productsResponse.data.products.length > 0) {
        const realProducts = productsResponse.data.products;
        console.log(`Found ${realProducts.length} real products`);
        
        const realCart = realProducts.map((product, index) => ({
          productId: product.id,
          price: product.variants[0]?.price || 100,
          quantity: 1,
          templeId: product.templeId,
          sellerId: product.sellerId
        }));
        
        const response = await axios.post(`${API_URL}/api/orders/calculate-fees`, {
          items: realCart
        });
        
        console.log('Real cart test:');
        console.log(`- Platform Fee: ₹${response.data.totalPlatformFee}`);
        console.log(`- Success: ${response.data.success}`);
        
        realProducts.forEach((product, index) => {
          console.log(`  - Product ${index + 1}: ${product.name} (₹${product.variants[0]?.price})`);
          console.log(`    Temple: ${product.templeId || 'No'}, Seller: ${product.sellerId || 'No'}`);
        });
        
      }
      
    } catch (error) {
      console.log('Error testing with real products:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testFrontendAPI();
