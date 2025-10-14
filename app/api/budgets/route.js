import { NextResponse } from 'next/server';
import { getUserBudgets, addBudget, updateBudget, deleteBudget } from '../../../lib/database.js';
import { isDemoMode, getDemoData } from '../../../lib/mockData.js';

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

    // Check if demo mode is enabled
    if (isDemoMode()) {
      const demoData = getDemoData();
      return NextResponse.json({
        success: true,
        budgets: demoData.budgets
      });
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

    if (!budgetData.category || budgetData.budget === undefined || budgetData.budget === null || budgetData.budget <= 0 || !budgetData.icon || !budgetData.color) {
      return NextResponse.json(
        { error: 'Category, budget (must be > 0), icon, and color are required' },
        { status: 400 }
      );
    }

    // Check if demo mode is enabled
    if (isDemoMode()) {
      // Return a mock budget response for demo mode
      const mockBudget = {
        id: `demo-budget-${Date.now()}`,
        ...budgetData,
        userId,
        spent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        budget: mockBudget
      });
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

    // Validate budget if provided
    if (budgetData.budget !== undefined && (budgetData.budget === null || budgetData.budget <= 0)) {
      return NextResponse.json(
        { error: 'Budget must be > 0' },
        { status: 400 }
      );
    }

    // Check if demo mode is enabled
    if (isDemoMode()) {
      // Return a mock updated budget response for demo mode
      const mockBudget = {
        id,
        ...budgetData,
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        budget: mockBudget
      });
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

    // Check if demo mode is enabled
    if (isDemoMode()) {
      // Return success response for demo mode (no actual deletion needed)
      return NextResponse.json({
        success: true,
        message: 'Budget deleted successfully'
      });
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