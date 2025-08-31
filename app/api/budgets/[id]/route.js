import { NextResponse } from 'next/server';
import { getBudgetWithTransactions } from '../../../../lib/database.js';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const budgetId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!budgetId) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    const budget = await getBudgetWithTransactions(userId, budgetId);

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      budget
    });

  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}