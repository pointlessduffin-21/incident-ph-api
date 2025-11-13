// Simple test script to verify tide endpoints
const http = require('http');

async function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`\n✅ ${path}`);
        console.log('Status:', res.statusCode);
        console.log('Data:', data.substring(0, 200) + '...');
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.log(`\n❌ ${path}`);
      console.log('Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing Tide Module Endpoints...\n');
  console.log('Make sure the server is running on port 3000!\n');

  try {
    await testEndpoint('/api/tide/locations');
    await testEndpoint('/api/tide/forecast/cordova-1');
    await testEndpoint('/api');
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.log('\n❌ Tests failed. Make sure the server is running.');
  }
}

runTests();
