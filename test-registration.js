// Test registration functionality
// Force override of environment variables by parsing files manually
const fs = require('fs');
const dotenv = require('dotenv');
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));
const merged = { ...envParsed, ...envLocalParsed };
Object.assign(process.env, merged);

async function testRegistration() {
  console.log('Testing registration API...\n');

  try {
    const testData = {
      name: 'Test User',
      email: 'testuser@example.com',
      member_id: 'TEST001',
      kelas: 'XII-A',
      phone: '081234567890',
      address: 'Test Address',
      password: 'testpassword123',
    };

    console.log('Sending registration request with data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log('Registration response:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    console.log('Full result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error during registration test:', error.message);
  }
}

testRegistration().catch(err => console.error('Test failed:', err));