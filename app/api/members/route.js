import { getConnection } from '@/lib/db';

// API to get all members
export async function GET(req) {
  try {
    const connection = await getConnection();
    
    const query = 'SELECT * FROM members ORDER BY name';
    
    const [rows] = await connection.execute(query);
    connection.release();
    
    return Response.json({ 
      success: true, 
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching members:', error);

    // More informative error message for debugging
    let errorMessage = `Error fetching members: ${error.message}`;

    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      errorMessage = "Database connection failed. Please make sure MySQL server is running and properly configured.";
    } else if (error.message.includes('database') || error.message.includes('Unknown database')) {
      errorMessage = "Database not found. Please run the database setup script first.";
    }

    return Response.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// API to add a new member
export async function POST(req) {
  try {
    const connection = await getConnection();
    const body = await req.json();
    
    const { 
      member_id, name, email, phone, address, membership_date 
    } = body;
    
    const query = `
      INSERT INTO members (member_id, name, email, phone, address, membership_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(query, [
      member_id, name, email, phone, address, membership_date
    ]);
    
    connection.release();
    
    return Response.json({ 
      success: true, 
      message: 'Member added successfully',
      memberId: result.insertId
    });
  } catch (error) {
    console.error('Error adding member:', error);

    // More informative error message for debugging
    let errorMessage = `Error adding member: ${error.message}`;

    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      errorMessage = "Database connection failed. Please make sure MySQL server is running and properly configured.";
    } else if (error.message.includes('database') || error.message.includes('Unknown database')) {
      errorMessage = "Database not found. Please run the database setup script first.";
    }

    return Response.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}