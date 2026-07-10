import { getConnection } from '@/lib/db';

// API to get all categories
export async function GET(req) {
  try {
    const connection = await getConnection();
    
    const query = 'SELECT id, name, description FROM categories ORDER BY name';
    
    const [rows] = await connection.execute(query);
    connection.release();
    
    return Response.json({ 
      success: true, 
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ 
      success: false, 
      message: `Error fetching categories: ${error.message}` 
    }, { status: 500 });
  }
}

// API to add a new category
export async function POST(req) {
  try {
    const connection = await getConnection();
    const body = await req.json();
    
    const { name, description } = body;
    
    const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    
    const [result] = await connection.execute(query, [name, description]);
    
    connection.release();
    
    return Response.json({ 
      success: true, 
      message: 'Category added successfully',
      categoryId: result.insertId
    });
  } catch (error) {
    console.error('Error adding category:', error);
    return Response.json({ 
      success: false, 
      message: `Error adding category: ${error.message}` 
    }, { status: 500 });
  }
}