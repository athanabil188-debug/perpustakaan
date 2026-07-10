import { fixBookAvailability, getBookAvailabilityStats, resetAllBookAvailability } from '@/lib/db-utils';

export async function GET(req) {
  try {
    // Get availability stats
    const stats = await getBookAvailabilityStats();

    if (!stats.success) {
      return Response.json({
        success: false,
        message: stats.message
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: stats.data
    });
  } catch (error) {
    console.error('Error getting availability stats:', error);
    return Response.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const action = body.action || 'fix';

    if (action === 'fix') {
      // Fix book availability based on active borrows
      const result = await fixBookAvailability();

      if (!result.success) {
        return Response.json({
          success: false,
          message: result.message
        }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: result.message
      });
    } else if (action === 'reset') {
      // Reset all book availability to full quantity (all books available)
      const result = await resetAllBookAvailability();

      if (!result.success) {
        return Response.json({
          success: false,
          message: result.message
        }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: result.message
      });
    } else if (action === 'stats') {
      // Get availability stats
      const stats = await getBookAvailabilityStats();

      if (!stats.success) {
        return Response.json({
          success: false,
          message: stats.message
        }, { status: 500 });
      }

      return Response.json({
        success: true,
        data: stats.data
      });
    } else {
      return Response.json({
        success: false,
        message: 'Invalid action. Use "fix", "reset", or "stats"'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in availability API:', error);
    return Response.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}