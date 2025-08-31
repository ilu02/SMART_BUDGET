import { NextResponse } from 'next/server';
import { getUserBudgets, addBudget, updateBudget, deleteBudget } from '../../../lib/database.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const budgets = await getUserBudgets(userId);

    return NextResponse.json({
      success: true,
      budgets
    });

  } catch (error) {
    console.error('Get budgets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, ...budgetData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!budgetData.category || !budgetData.budget || !budgetData.icon || !budgetData.color) {
      return NextResponse.json(
        { error: 'Category, budget, icon, and color are required' },
        { status: 400 }
      );
    }

    const budget = await addBudget(userId, budgetData);

    return NextResponse.json({
      success: true,
      budget
    });

  } catch (error) {
    console.error('Add budget error:', error);
    
    // Handle unique constraint violation (category already exists for user)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Budget for this category already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, ...budgetData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    const budget = await updateBudget(id, budgetData);

    return NextResponse.json({
      success: true,
      budget
    });

  } catch (error) {
    console.error('Update budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    await deleteBudget(id);

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully'
    });

  } catch (error) {
    console.error('Delete budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}