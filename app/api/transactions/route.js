import { NextResponse } from 'next/server';
import { getUserTransactions, addTransaction, updateTransaction, deleteTransaction, updateBudgetSpent, getUserSettings } from '../../../lib/database.js';
import { createTransactionAlert, createBudgetAlert } from '../../contexts/NotificationContext'; 


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

        // 1. Fetch user settings for notification thresholds and currency
        const userSettings = await getUserSettings(userId);
        const currencySymbol = userSettings?.currencySymbol || '$'; // Use a default if setting is missing
        const largeThreshold = userSettings?.largeTransactionThreshold || 1000; // Use a default if setting is missing
        const budgetThreshold = userSettings?.budgetThreshold || 0.80; // Default to 80% threshold (0.80)

        // 2. Add transaction to DB and get the final object (includes updatedBudget if applicable)
        const transactionResult = await addTransaction(userId, transactionData);
        const transaction = transactionResult;

        // 3. Check for and generate notifications
        const notificationsToSend = [];

        // Large Transaction Alert Check: Only for expense type transactions
        if (transaction.type === 'expense' && transaction.amount >= largeThreshold) {
            const alert = createTransactionAlert(
                transaction.amount,
                transaction.merchant || transaction.description, // Use merchant field if available, otherwise description
                currencySymbol
            );
            notificationsToSend.push(alert);
        }

        // Budget Alert Check: If this transaction affected a budget, check if threshold exceeded
        if (transaction.updatedBudget && transaction.type === 'expense') {
            const { category, spent, budget } = transaction.updatedBudget;
            const percentageSpent = spent / budget; // Calculate as decimal (0.0 to 1.0)
            
            // Generate alert if spent exceeds the threshold (default 80% = 0.80)
            if (percentageSpent >= budgetThreshold) {
                const budgetAlert = createBudgetAlert(
                    category,
                    spent,
                    budget,
                    currencySymbol,
                    budgetThreshold * 100 // Convert to percentage for display
                );
                notificationsToSend.push(budgetAlert);
            }
        }

        // Clean up the transaction object before returning (remove updatedBudget)
        const { updatedBudget, ...cleanTransaction } = transaction;

        // 4. Return transaction and any generated notifications
        return NextResponse.json({
            success: true,
            transaction: cleanTransaction,
            notifications: notificationsToSend, // Send generated notifications
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