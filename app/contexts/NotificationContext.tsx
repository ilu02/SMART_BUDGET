// app/contexts/NotificationContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSettings } from './SettingsContext'; 

export interface Notification {
    id: string;
    type: 'budget' | 'transaction' | 'bill' | 'goal' | 'system' | 'security';
    title: string;
    message: string;
    timestamp: Date; 
    read: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    actionText?: string;
    category?: string;
    amount?: number;
    budget?: number; // Kept for server payload compatibility if needed
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void; 
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAllRead: () => void;
    getNotificationsByType: (type: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export function NotificationProvider({ children }: { children: ReactNode }) {
    const { notifications: notificationSettings, formatCurrency } = useSettings(); 

    // 1. Initialize state to an empty array for both server and client (Hydration Fix)
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // 2. Load notifications from localStorage only on mount (client-side)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('notifications');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Convert timestamp strings back to Date objects
                    const withDates = parsed.map((n: any) => ({
                        ...n,
                        timestamp: new Date(n.timestamp)
                    }));
                    setNotifications(withDates);
                }
            } catch (error) {
                console.error('Failed to load notifications from localStorage:', error);
            }
        }
    }, []); // Empty dependency array fixes hydration error

    // 3. Keep: Save notifications to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const serializableNotifications = notifications.map(n => ({
                    ...n,
                    timestamp: n.timestamp.toISOString(),
                }));
                localStorage.setItem('notifications', JSON.stringify(serializableNotifications));
            } catch (error) {
                console.error('Error saving notifications to localStorage:', error);
            }
        }
    }, [notifications]);

    // 4. RESTORED & CORRECTED: addNotification logic
    const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'read'>) => {
        // Check if this type of notification is enabled
        const shouldShowNotification = () => {
            switch (notificationData.type) {
                case 'budget': return notificationSettings.budgetAlerts;
                case 'transaction': return notificationSettings.largeTransactions;
                case 'bill': return notificationSettings.billReminders;
                case 'goal': return notificationSettings.goalReminders;
                case 'system': return notificationSettings.productUpdates;
                case 'security': return true;
                default: return true;
            }
        };

        if (!shouldShowNotification()) {
            return; 
        }

        const newNotification: Notification = {
            ...notificationData,
            // Ensure a unique ID is generated
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            // The timestamp is now included in notificationData from the caller (e.g., createBudgetAlert)
            // This line ensures it's a Date object if the caller passed a string, or defaults to now if somehow missing.
            timestamp: new Date(notificationData.timestamp || Date.now()), 
            read: false
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show toast notification 
        if (notificationSettings.pushNotifications && (notificationData.priority === 'high' || notificationData.priority === 'urgent')) {
            toast.error(notificationData.title, {
                duration: 5000,
                icon: '🚨'
            });
        }
    }, [notificationSettings]); // Depend on notificationSettings

    // The rest of the functions were correct
    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearAllRead = () => {
        setNotifications(prev => prev.filter(notification => !notification.read));
    };

    const getNotificationsByType = (type: string) => {
        return notifications.filter(notification => notification.type === type);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearAllRead,
                getNotificationsByType
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

// --- Utility functions for creating common notification types (Used by your API routes) ---

export const createBudgetAlert = (category: string, spent: number, budget: number, currency: string = '$') => ({
    type: 'budget' as const,
    title: `Budget Alert: ${category}`,
    message: `You've spent ${Math.round((spent / budget) * 100)}% of your ${category.toLowerCase()} budget (${currency}${spent} of ${currency}${budget})`,
    timestamp: new Date(),
    priority: spent / budget > 0.9 ? 'urgent' as const : spent / budget > 0.8 ? 'high' as const : 'medium' as const,
    actionUrl: '/budgets',
    actionText: 'View Budget',
    category,
    amount: spent
});

export const createTransactionAlert = (amount: number, merchant: string, currency: string = '$') => ({
    type: 'transaction' as const,
    title: 'Large Transaction Detected',
    message: `A transaction of ${currency}${amount} was recorded at ${merchant}`,
    timestamp: new Date(),
    priority: amount > 5000 ? 'high' as const : 'medium' as const,
    actionUrl: '/transactions',
    actionText: 'View Transaction',
    amount
});

export const createBillReminder = (billName: string, amount: number, daysUntilDue: number, currency: string = '$') => ({
    type: 'bill' as const,
    title: 'Bill Reminder',
    message: `Your ${billName} bill (${currency}${amount}) is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
    timestamp: new Date(),
    priority: daysUntilDue <= 1 ? 'urgent' as const : daysUntilDue <= 3 ? 'high' as const : 'medium' as const,
    actionUrl: '/transactions',
    actionText: 'Pay Now',
    amount
});

export const createGoalAchievement = (goalName: string, percentage: number) => ({
    type: 'goal' as const,
    title: 'Savings Goal Achievement',
    message: `Congratulations! You've reached ${percentage}% of your ${goalName} goal`,
    timestamp: new Date(),
    priority: percentage >= 100 ? 'high' as const : 'low' as const,
    actionUrl: '/dashboard',
    actionText: 'View Goals'
});

// --- NEW UTILITY FUNCTIONS FOR ADDITIONAL NOTIFICATIONS ---

/**
 * Creates an alert for when an account balance drops below a critical threshold.
 */
export const createLowBalanceAlert = (accountName: string, currentBalance: number, threshold: number, currency: string = '$') => ({
    type: 'security' as const, // Critical alert for account safety
    title: '⚠️ Low Account Balance Alert',
    message: `Your ${accountName} balance is critical: ${currency}${currentBalance.toFixed(2)}. This is below your threshold of ${currency}${threshold.toFixed(2)}.`,
    timestamp: new Date(),
    priority: 'urgent' as const,
    actionUrl: '/accounts',
    actionText: 'View Accounts',
    amount: currentBalance,
});

/**
 * Creates an alert for unusual transactions based on historical averages.
 */
export const createIrregularSpendingAlert = (merchant: string, category: string, amount: number, averageAmount: number, currency: string = '$') => ({
    type: 'transaction' as const,
    title: 'Unusual Spending Detected',
    message: `You spent ${currency}${amount.toFixed(2)} at ${merchant} in ${category}. This is significantly higher than your average of ${currency}${averageAmount.toFixed(2)}.`,
    timestamp: new Date(),
    priority: 'high' as const,
    actionUrl: '/transactions',
    actionText: 'Review Transaction',
    category,
    amount,
});

/**
 * Notifies the user that a recurring financial report is ready.
 */
export const createReportAvailableNotification = (reportPeriod: 'Weekly' | 'Monthly', keyInsight: string) => ({
    type: 'system' as const,
    title: `${reportPeriod} Report Available`,
    message: `Your ${reportPeriod.toLowerCase()} spending report is ready to view. Key Insight: ${keyInsight}`,
    timestamp: new Date(),
    priority: 'low' as const,
    actionUrl: '/analytics',
    actionText: 'View Report',
});