import { getConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const connection = await getConnection();
    const body = await req.json();

    const { name, email, member_id, kelas, phone, address, password } = body;

    // Validation
    if (!name || !email || !member_id || !password) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Nama, email, NIS/NIP, dan password wajib diisi.'
      }, { status: 400 });
    }

    // Check if member with this email or member_id already exists
    const checkEmailQuery = 'SELECT id FROM members WHERE email = ?';
    const checkMemberIdQuery = 'SELECT id FROM members WHERE member_id = ?';
    
    const [emailRows] = await connection.execute(checkEmailQuery, [email]);
    const [memberIdRows] = await connection.execute(checkMemberIdQuery, [member_id]);

    if (emailRows.length > 0) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Email sudah terdaftar. Gunakan email lain.'
      }, { status: 400 });
    }

    if (memberIdRows.length > 0) {
      connection.release();
      return Response.json({
        success: false,
        message: 'NIS/NIP sudah terdaftar. Gunakan NIS/NIP lain.'
      }, { status: 400 });
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Check if password column exists, if not, we'll need to handle differently
    // For now, we'll add the password to the query assuming it exists in the schema
    // If the column doesn't exist, we need to add it first
    const insertQuery = `
      INSERT INTO members (member_id, name, email, kelas, phone, address, membership_date, status, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'active', ?)
    `;

    const [result] = await connection.execute(insertQuery, [
      member_id,
      name,
      email,
      kelas || null,
      phone || null,
      address || null,
      password_hash
    ]);

    connection.release();

    return Response.json({
      success: true,
      message: 'Registrasi berhasil! Akun Anda telah dibuat.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error during registration:', error);
    
    let errorMessage = `Error during registration: ${error.message}`;

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