const bcrypt = require('bcryptjs');

// Hash password "Nabil_carisa"
const password = "Nabil_carisa";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  
  console.log('Username: Nabil');
  console.log('Password: Nabil_carisa');
  console.log('Password Hash:', hash);
  
  // Command to insert the admin user
  console.log('\nUse this SQL to insert the admin:');
  console.log(`INSERT INTO librarians (username, password_hash, name, email, role) VALUES ('Nabil', '${hash}', 'Nabil', 'nabil@library.com', 'admin');`);
});