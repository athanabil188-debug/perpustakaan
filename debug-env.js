// Reset the environment variable to undefined first to ensure clean test
delete process.env.DB_PORT;

// Parse both files to see their raw content
const fs = require('fs');
const dotenv = require('dotenv');

// Parse .env file content
const envContent = fs.readFileSync('./.env', 'utf8');
console.log('.env file content:');
console.log(envContent);
console.log('---');

// Parse .env.local file content
const envLocalContent = fs.readFileSync('./.env.local', 'utf8');
console.log('.env.local file content:');
console.log(envLocalContent);
console.log('---');

// Parse both files separately
const envParsed = dotenv.parse(envContent);
const envLocalParsed = dotenv.parse(envLocalContent);

console.log('.env parsed object:', envParsed);
console.log('.env.local parsed object:', envLocalParsed);

// Set process.env values in the correct order (env.local should override env)
Object.assign(process.env, envParsed);  // Load .env first
Object.assign(process.env, envLocalParsed);  // .env.local overrides

console.log('\nFinal environment variables:');
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_HOST:', process.env.DB_HOST);