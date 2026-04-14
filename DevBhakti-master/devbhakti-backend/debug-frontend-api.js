const axios = require('axios');

async function debugFrontendAPI() {
  try {
    console.log('=== DEBUGGING FRONTEND API ISSUE ===');
    
    // Test what API_URL resolves to in frontend
    console.log('\n1. Testing API URL configurations...');
    
    // Simulate frontend API_URL logic
    const isBrowser = true;
    const host = isBrowser ? "http://localhost:3000" : "http://localhost:5000";
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || `${host}/api`;
    const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    
    console.log('- Host:', host);
    console.log('- Raw URL:', rawUrl);
    console.log('- Final API_URL:', API_URL);
    console.log('- Expected full URL:', `${API_URL}/orders/calculate-fees`);
    
    // Test different URL combinations
    const testUrls = [
      'http://localhost:3000/api/orders/calculate-fees',
      'http://localhost:5000/api/orders/calculate-fees',
      'http://localhost:3000/orders/calculate-fees',
      'http://localhost:5000/orders/calculate-fees'
    ];
    
    console.log('\n2. Testing different URL combinations...');
    
    for (const url of testUrls) {
      try {
        console.log(`\nTesting: ${url}`);
        const response = await axios.post(url, {
          items: [
            { productId: 'test', price: 100, quantity: 1, templeId: 'cmnsospsm000wvqfodch2j45a' }
          ]
        }, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ SUCCESS: Status ${response.status}, Platform Fee: ${response.data.totalPlatformFee}`);
        
      } catch (error) {
        console.log(`❌ ERROR: ${error.response?.status || 'NETWORK'} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Check if frontend is making requests to wrong port
    console.log('\n3. Checking CORS and port issues...');
    
    try {
      // Test direct backend call
      const backendResponse = await axios.post('http://localhost:5000/api/orders/calculate-fees', {
        items: [{ productId: 'test', price: 100, quantity: 1, templeId: 'cmnsospsm000wvqfodch2j45a' }]
      });
      console.log('✅ Backend direct call works:', backendResponse.data.totalPlatformFee);
      
      // Test if frontend proxy is working
      const frontendResponse = await axios.post('http://localhost:3000/api/orders/calculate-fees', {
        items: [{ productId: 'test', price: 100, quantity: 1, templeId: 'cmnsospsm000wvqfodch2j45a' }]
      });
      console.log('✅ Frontend proxy works:', frontendResponse.data.totalPlatformFee);
      
    } catch (error) {
      console.log('❌ Proxy or CORS issue:', error.message);
    }
    
    // Test what happens with empty cart
    console.log('\n4. Testing empty cart scenario...');
    
    try {
      const emptyResponse = await axios.post('http://localhost:5000/api/orders/calculate-fees', {
        items: []
      });
      console.log('Empty cart response:', emptyResponse.data);
    } catch (error) {
      console.log('Empty cart error:', error.message);
    }
    
    console.log('\n=== DEBUGGING RECOMMENDATIONS ===');
    console.log('1. Check browser console for CORS errors');
    console.log('2. Check if cartItems is populated in frontend');
    console.log('3. Check if API_URL is correctly resolved');
    console.log('4. Check if useEffect is triggering');
    console.log('5. Check network tab in browser dev tools');
    
  } catch (error) {
    console.error('Debug Error:', error);
  }
}

debugFrontendAPI();
