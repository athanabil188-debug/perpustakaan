import { getConnection } from '@/lib/db';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    let titleParam = url.searchParams.get('title');

    // Handle potential null/undefined values properly
    if (!titleParam || typeof titleParam !== 'string') {
      return Response.json({
        success: false,
        message: 'Title parameter is required and must be a string'
      }, { status: 400 });
    }

    // Ensure the parameter is trimmed and not empty
    const title = titleParam.trim();
    if (!title) {
      return Response.json({
        success: false,
        message: 'Title parameter cannot be empty'
      }, { status: 400 });
    }

    const connection = await getConnection();

    const query = `
      SELECT b.*,
             a.name as author_name,
             c.name as category_name,
             p.name as publisher_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN publishers p ON b.publisher_id = p.id
      WHERE b.title LIKE ?
    `;

    const [rows] = await connection.execute(query, [`%${title}%`]);
    connection.release();

    if (rows.length === 0) {
      return Response.json({
        success: false,
        message: 'Book not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error searching books:', error);

    return Response.json({
      success: false,
      message: `Error searching books: ${error.message}`
    }, { status: 500 });
  }
}