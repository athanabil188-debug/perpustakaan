// Test environment variable loading priority

// First, let's see if there's an environment variable already set
console.log('Before dotenv - DB_PORT:', process.env.DB_PORT);

// Load .env first  
require('dotenv').config({ path: './.env' });
console.log('After .env - DB_PORT:', process.env.DB_PORT);

// Load .env.local second (should override)
require('dotenv').config({ path: './.env.local' });
console.log('After .env.local - DB_PORT:', process.env.DB_PORT);

// Test the port conversion logic as used in the script
const portFromEnv = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
console.log('Port after parseInt logic:', portFromEnv);

// Try with fresh process.env
delete require.cache[require.resolve('dotenv')]; // This won't work as dotenv is already loaded
// So let's just parse the files manually to see the values
const fs = require('fs');
const dotenv = require('dotenv');

const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));

console.log('\nParsed .env:', envParsed);
console.log('Parsed .env.local:', envLocalParsed);

// Now manually apply the override logic
const finalConfig = { ...envParsed, ...envLocalParsed };
console.log('Final merged config:', finalConfig);
console.log('Final DB_PORT:', finalConfig.DB_PORT);