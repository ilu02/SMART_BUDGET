import { NextResponse } from 'next/server';
import { getUserTransactions, addTransaction, updateTransaction, deleteTransaction, updateBudgetSpent } from '../../../lib/database.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const budgetId = searchParams.get('budgetId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const transactions = await getUserTransactions(userId, budgetId);

    return NextResponse.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, ...transactionData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!transactionData.amount || !transactionData.description || !transactionData.category || !transactionData.type) {
      return NextResponse.json(
        { error: 'Amount, description, category, and type are required' },
        { status: 400 }
      );
    }

    const transaction = await addTransaction(userId, transactionData);

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Add transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, ...transactionData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const transaction = await updateTransaction(id, transactionData);

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Update transaction error:', error);
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
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    await deleteTransaction(id);

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}