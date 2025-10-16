// app/contexts/NotificationContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSettings } from './SettingsContext';
import { createBudgetAlert, createTransactionAlert, createBillReminder, createGoalAchievement, createLowBalanceAlert, createIrregularSpendingAlert, createReportAvailableNotification } from '../../lib/notificationUtils'; 

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
    threshold?: number;
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

    // 1. Initialize state - try to load from localStorage immediately for hydration
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('notifications');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Convert timestamp strings back to Date objects
                    return parsed.map((n: any) => ({
                        ...n,
                        timestamp: new Date(n.timestamp)
                    }));
                }
            } catch (error) {
                console.error('Failed to load notifications from localStorage on init:', error);
            }
        }
        return [];
    });

    // 2. Ensure notifications are loaded from localStorage on mount (fallback)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('notifications');
                if (saved && notifications.length === 0) {
                    const parsed = JSON.parse(saved);
                    const withDates = parsed.map((n: any) => ({
                        ...n,
                        timestamp: new Date(n.timestamp)
                    }));
                    setNotifications(withDates);
                }
            } catch (error) {
                console.error('Failed to load notifications from localStorage on mount:', error);
            }
        }
    }, []);

    // 3. Save notifications to localStorage whenever they change - with debouncing
    useEffect(() => {
        if (typeof window !== 'undefined' && notifications.length > 0) {
            // Use a small timeout to batch multiple updates
            const timeoutId = setTimeout(() => {
                try {
                    const serializableNotifications = notifications.map(n => ({
                        ...n,
                        timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp,
                    }));
                    localStorage.setItem('notifications', JSON.stringify(serializableNotifications));
                } catch (error) {
                    console.error('Error saving notifications to localStorage:', error);
                }
            }, 100);

            return () => clearTimeout(timeoutId);
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
            // Ensure timestamp is a Date object
            // If it's already a Date, keep it; if it's a string, parse it; if missing, use now
            timestamp: notificationData.timestamp instanceof Date 
                ? notificationData.timestamp 
                : new Date(notificationData.timestamp || Date.now()),
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
        setNotifications(prev => {
            const unreadNotifications = prev.filter(notification => !notification.read);
            // If all notifications are cleared, explicitly remove from localStorage
            if (unreadNotifications.length === 0 && typeof window !== 'undefined') {
                try {
                    localStorage.removeItem('notifications');
                } catch (error) {
                    console.error('Error clearing notifications from localStorage:', error);
                }
            }
            return unreadNotifications;
        });
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

// --- Utility functions are now imported from notificationUtils.js ---
// This allows them to be used in both server-side routes and client components
// without the 'use client' constraint

// Re-export for backward compatibility
export {
    createBudgetAlert,
    createTransactionAlert,
    createBillReminder,
    createGoalAchievement,
    createLowBalanceAlert,
    createIrregularSpendingAlert,
    createReportAvailableNotification
} from '../../lib/notificationUtils';