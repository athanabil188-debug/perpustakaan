// Test registration functionality directly through the API handler
// Force override of environment variables by parsing files manually
const fs = require('fs');
const dotenv = require('dotenv');
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));
const merged = { ...envParsed, ...envLocalParsed };
Object.assign(process.env, merged);

// Mock the Next.js request object
const mockRequest = {
  json: async () => ({
    name: 'Test User',
    email: 'testuser2@example.com',
    member_id: 'TEST002',
    kelas: 'XII-Science',
    phone: '081234567891',
    address: 'Test Address 2',
    password: 'testpassword123'
  })
};

async function testRegistrationAPI() {
  console.log('Testing registration API handler directly...\n');

  // Dynamically import the route handler
  const { POST: registerPOST } = require('./app/api/auth/register/route.js');
  
  try {
    // Call the POST function directly
    const response = await registerPOST({ json: mockRequest.json });
    
    console.log('Response status:', response.status);
    
    // Extract the response body
    const responseBody = await response.json();
    console.log('Response body:', JSON.stringify(responseBody, null, 2));
    
  } catch (error) {
    console.error('Error calling registration API:', error);
  }
}

testRegistrationAPI().catch(err => console.error('Test failed:', err));