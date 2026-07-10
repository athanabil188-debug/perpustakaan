import { getConnection } from '@/lib/db';

// API to get all publishers
export async function GET(req) {
  try {
    const connection = await getConnection();
    
    const query = 'SELECT id, name, address, phone, email FROM publishers ORDER BY name';
    
    const [rows] = await connection.execute(query);
    connection.release();
    
    return Response.json({ 
      success: true, 
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching publishers:', error);
    return Response.json({ 
      success: false, 
      message: `Error fetching publishers: ${error.message}` 
    }, { status: 500 });
  }
}

// API to add a new publisher
export async function POST(req) {
  try {
    const connection = await getConnection();
    const body = await req.json();
    
    const { name, address, phone, email } = body;
    
    const query = 'INSERT INTO publishers (name, address, phone, email) VALUES (?, ?, ?, ?)';
    
    const [result] = await connection.execute(query, [name, address, phone, email]);
    
    connection.release();
    
    return Response.json({ 
      success: true, 
      message: 'Publisher added successfully',
      publisherId: result.insertId
    });
  } catch (error) {
    console.error('Error adding publisher:', error);
    return Response.json({ 
      success: false, 
      message: `Error adding publisher: ${error.message}` 
    }, { status: 500 });
  }
}