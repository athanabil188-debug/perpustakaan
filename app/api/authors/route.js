import { getConnection } from '@/lib/db';

// API to get all authors
export async function GET(req) {
  try {
    const connection = await getConnection();
    
    const query = 'SELECT id, name, biography FROM authors ORDER BY name';
    
    const [rows] = await connection.execute(query);
    connection.release();
    
    return Response.json({ 
      success: true, 
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return Response.json({ 
      success: false, 
      message: `Error fetching authors: ${error.message}` 
    }, { status: 500 });
  }
}

// API to add a new author
export async function POST(req) {
  try {
    const connection = await getConnection();
    const body = await req.json();
    
    const { name, biography } = body;
    
    const query = 'INSERT INTO authors (name, biography) VALUES (?, ?)';
    
    const [result] = await connection.execute(query, [name, biography]);
    
    connection.release();
    
    return Response.json({ 
      success: true, 
      message: 'Author added successfully',
      authorId: result.insertId
    });
  } catch (error) {
    console.error('Error adding author:', error);
    return Response.json({ 
      success: false, 
      message: `Error adding author: ${error.message}` 
    }, { status: 500 });
  }
}