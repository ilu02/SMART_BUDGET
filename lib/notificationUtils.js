// lib/notificationUtils.js
// Server-side utility functions for creating notification objects
// These can be used in API routes without the 'use client' constraint

export const createBudgetAlert = (category, spent, budget, currency = '$', threshold) => ({
    type: 'budget',
    title: `Budget Alert: ${category}`,
    message: `You've spent ${Math.round((spent / budget) * 100)}% of your ${category.toLowerCase()} budget (${currency}${spent} of ${currency}${budget})`,
    timestamp: new Date(),
    priority: spent / budget > 0.9 ? 'urgent' : spent / budget > 0.8 ? 'high' : 'medium',
    actionUrl: '/budgets',
    actionText: 'View Budget',
    category,
    amount: spent,
    threshold
});

export const createTransactionAlert = (amount, merchant, currency = '$') => ({
    type: 'transaction',
    title: 'Large Transaction Detected',
    message: `A transaction of ${currency}${amount} was recorded at ${merchant}`,
    timestamp: new Date(),
    priority: amount > 5000 ? 'high' : 'medium',
    actionUrl: '/transactions',
    actionText: 'View Transaction',
    amount
});

export const createBillReminder = (billName, amount, daysUntilDue, currency = '$') => ({
    type: 'bill',
    title: 'Bill Reminder',
    message: `Your ${billName} bill (${currency}${amount}) is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
    timestamp: new Date(),
    priority: daysUntilDue <= 1 ? 'urgent' : daysUntilDue <= 3 ? 'high' : 'medium',
    actionUrl: '/transactions',
    actionText: 'Pay Now',
    amount
});

export const createGoalAchievement = (goalName, percentage) => ({
    type: 'goal',
    title: 'Savings Goal Achievement',
    message: `Congratulations! You've reached ${percentage}% of your ${goalName} goal`,
    timestamp: new Date(),
    priority: percentage >= 100 ? 'high' : 'low',
    actionUrl: '/dashboard',
    actionText: 'View Goals'
});

export const createLowBalanceAlert = (accountName, currentBalance, threshold, currency = '$') => ({
    type: 'security',
    title: '⚠️ Low Account Balance Alert',
    message: `Your ${accountName} balance is critical: ${currency}${currentBalance.toFixed(2)}. This is below your threshold of ${currency}${threshold.toFixed(2)}.`,
    timestamp: new Date(),
    priority: 'urgent',
    actionUrl: '/accounts',
    actionText: 'View Accounts',
    amount: currentBalance,
});

export const createIrregularSpendingAlert = (merchant, category, amount, averageAmount, currency = '$') => ({
    type: 'transaction',
    title: 'Unusual Spending Detected',
    message: `You spent ${currency}${amount.toFixed(2)} at ${merchant} in ${category}. This is significantly higher than your average of ${currency}${averageAmount.toFixed(2)}.`,
    timestamp: new Date(),
    priority: 'high',
    actionUrl: '/transactions',
    actionText: 'Review Transaction',
    category,
    amount,
});

export const createReportAvailableNotification = (reportPeriod, keyInsight) => ({
    type: 'system',
    title: `${reportPeriod} Report Available`,
    message: `Your ${reportPeriod.toLowerCase()} spending report is ready to view. Key Insight: ${keyInsight}`,
    timestamp: new Date(),
    priority: 'low',
    actionUrl: '/analytics',
    actionText: 'View Report',
});