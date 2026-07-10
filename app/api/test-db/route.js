import { testConnection } from '@/lib/db';

export async function GET(req) {
  try {
    const result = await testConnection();

    if (result.success) {
      return Response.json({
        message: result.message,
        connected: true
      });
    } else {
      return Response.json({
        message: result.message,
        connected: false
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database connection test failed:', error);

    // More informative error message for debugging
    let errorMessage = `Database connection failed: ${error.message}`;

    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      errorMessage = "Database connection refused. Please make sure MySQL server is running and properly configured.";
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('ETIMEDOUT')) {
      errorMessage = "Database connection timeout. Please check if the MySQL server is running and accessible.";
    } else if (error.message.includes('database') || error.message.includes('Unknown database')) {
      errorMessage = "Database not found. Please run the database setup script first.";
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = "Database access denied. Please check your database credentials in the .env file.";
    }

    return Response.json({
      message: errorMessage,
      connected: false
    }, { status: 500 });
  }
}