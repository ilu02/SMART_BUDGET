import { NextResponse } from 'next/server';
import { resetDemoData, DEMO_CREDENTIALS } from '../../../../lib/database.js';

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Only allow demo account to reset
    if (email !== DEMO_CREDENTIALS.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await resetDemoData();

    return NextResponse.json({
      success: true,
      message: 'Demo data reset successfully'
    });

  } catch (error) {
    console.error('Demo reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}