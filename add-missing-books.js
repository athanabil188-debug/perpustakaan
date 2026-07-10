// Force override of environment variables by parsing files manually
// This handles cases where system environment variables override .env files
const fs = require('fs');
const dotenv = require('dotenv');

// Parse both files
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));

// Merge with .env.local taking precedence
const merged = { ...envParsed, ...envLocalParsed };

// Apply to process.env (this will override existing values)
Object.assign(process.env, merged);

const mysql = require('mysql2/promise');

async function addMissingBooks() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    console.log('Adding missing books to the database...\n');

    // Check if authors exist, if not, add them
    const authors = [
      { name: 'Tim cv detok pusaka', nationality: 'Indonesian' },
      { name: 'Dr.Yahfizham, ST, M,Cs & Dr.Irwan Yusti, M. Kom.', nationality: 'Indonesian' },
      { name: 'Tim Wellbook', nationality: 'Indonesian' },
    ];

    for (const author of authors) {
      const [result] = await connection.execute(
        'INSERT IGNORE INTO authors (name, nationality) VALUES (?, ?)',
        [author.name, author.nationality]
      );
      console.log(`✓ Added/verified author: ${author.name}`);
    }

    // Check if publishers exist, if not, add them
    const publishers = [
      { name: 'N/A', address: 'N/A' },
    ];

    for (const publisher of publishers) {
      const [result] = await connection.execute(
        'INSERT IGNORE INTO publishers (name, address) VALUES (?, ?)',
        [publisher.name, publisher.address]
      );
      console.log(`✓ Added/verified publisher: ${publisher.name}`);
    }

    // Now get the IDs of the created/verified entries
    const [authorRows] = await connection.execute('SELECT id, name FROM authors WHERE name IN (?, ?, ?)',
      authors.map(a => a.name));
    const authorMap = {};
    authorRows.forEach(row => {
      authorMap[row.name] = row.id;
    });

    const [publisherRows] = await connection.execute('SELECT id, name FROM publishers WHERE name = ?', ['N/A']);
    const publisherMap = {};
    publisherRows.forEach(row => {
      publisherMap[row.name] = row.id;
    });

    // Now add the missing books that correspond to static pages
    const missingBooks = [
      {
        title: 'Putih Abu-Abu',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku kisah kasih SMA',
        cover_image_url: '/IMG/kisah-kasih-SMA.jpeg',
        rack_location: 'SMA A1'
      },
      {
        title: 'Bahasa Indonesia',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku Bahasa Indonesia',
        cover_image_url: '/IMG/bahasa_indonesia.jpg',
        rack_location: 'IND A1'
      },
      {
        title: 'Text Cerita Sejarah',
        author_id: authorMap['Tim Wellbook'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 8,
        quantity: 8,
        description: 'Buku teks cerita sejarah',
        cover_image_url: '/IMG/teks_cerita_sejarah.jpg',
        rack_location: 'HIS A1'
      },
      {
        title: 'Bahasa Inggris',
        author_id: authorMap['Tim Wellbook'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 8,
        quantity: 8,
        description: 'Buku Bahasa Inggris',
        cover_image_url: '/IMG/Bahasa inggris.jpeg',
        rack_location: 'ENG A1'
      },
      {
        title: 'PAI XI',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku Pendidikan Agama Islam',
        cover_image_url: '/IMG/PAI.jpeg',
        rack_location: 'REL A1'
      },
      {
        title: 'ALGORITMA PEMROGRAMAN',
        author_id: authorMap['Dr.Yahfizham, ST, M,Cs & Dr.Irwan Yusti, M. Kom.'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku tentang algoritma pemrograman',
        cover_image_url: '/IMG/Algoritma_Pemprograman.jpeg',
        rack_location: 'COMP A1'
      },
      {
        title: 'Animasi 2d-3d',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku kisah kasih SMA',
        cover_image_url: '/IMG/ANIMASI 2D dan 3D.jpg',
        rack_location: 'ART A1'
      },
      {
        title: 'Sejarah',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku sejarah',
        cover_image_url: '/IMG/sejarah.jpg',
        rack_location: 'HIS B1'
      },
      {
        title: 'Cerita yang Lepas dari Genggaman',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku cerita',
        cover_image_url: '/IMG/cerita lepas genggaman.jpg',
        rack_location: 'FIC A1'
      },
      {
        title: 'Sekolah di Atas Bukit',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku tentang sekolah',
        cover_image_url: '/IMG/Sekolah di atas bukit.jpg',
        rack_location: 'SCH A1'
      },
      {
        title: 'Dongeng Teladan dari Dunia Binatang',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku dongeng',
        cover_image_url: '/IMG/Dongeng teladan.jpg',
        rack_location: 'FAB A1'
      },
      {
        title: 'Dongeng Nina Bobo',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku dongeng anak',
        cover_image_url: '/IMG/Dongeng Nina Bobo.jpg',
        rack_location: 'FAB B1'
      },
      {
        title: 'Persahabatan',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku tentang persahabatan',
        cover_image_url: '/IMG/Persahabatan.jpg',
        rack_location: 'REL B1'
      },
      {
        title: 'ilmu pengetahuan bumi dan antariksa',
        author_id: authorMap['Tim cv detok pusaka'],
        publisher_id: publisherMap['N/A'],
        available_quantity: 6,
        quantity: 6,
        description: 'Buku ilmu pengetahuan',
        cover_image_url: '/IMG/Bumi dan Antariska.jpg',
        rack_location: 'SCI A1'
      }
    ];

    for (const book of missingBooks) {
      // Check if book already exists by title
      const [existing] = await connection.execute('SELECT id FROM books WHERE title = ?', [book.title]);
      
      if (existing.length === 0) {
        // Add the book if it doesn't exist
        const query = `
          INSERT INTO books (title, author_id, publisher_id, available_quantity, quantity, 
                            description, cover_image_url, rack_location)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(query, [
          book.title, 
          book.author_id, 
          book.publisher_id,
          book.available_quantity, 
          book.quantity, 
          book.description,
          book.cover_image_url,
          book.rack_location
        ]);

        console.log(`✓ Added book: ${book.title}`);
      } else {
        console.log(`- Book already exists: ${book.title}`);
      }
    }

    await connection.end();
    console.log('\n🎉 All missing books added successfully!');
  } catch (error) {
    console.error('❌ Error adding missing books:', error.message);
  }
}

addMissingBooks();