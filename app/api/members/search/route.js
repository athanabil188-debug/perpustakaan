import { getConnection } from '@/lib/db';

// API to search for a member by various criteria (NIS, email, etc.)
export async function POST(req) {
  try {
    const connection = await getConnection();
    const body = await req.json();

    const { nis, email, name } = body;

    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];

    if (nis) {
      query += ' AND (member_id = ? OR nis = ?)';
      params.push(nis, nis);
    }

    if (email) {
      query += ' AND email = ?';
      params.push(email);
    }

    if (name) {
      query += ' AND name = ?';
      params.push(name);
    }

    const [rows] = await connection.execute(query, params);
    connection.release();

    if (rows.length > 0) {
      return Response.json({
        success: true,
        data: rows[0], // Return first match
        count: rows.length
      });
    } else {
      return Response.json({
        success: false,
        message: 'Member not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error searching member:', error);

    let errorMessage = `Error searching member: ${error.message}`;

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