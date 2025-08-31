'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllRead: () => void;
  getNotificationsByType: (type: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock initial notifications for demo purposes
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'budget',
    title: 'Budget Alert: Food & Dining',
    message: 'You\'ve spent 85% of your monthly food budget (K850 of K1,000)',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    priority: 'high',
    actionUrl: '/budgets',
    actionText: 'View Budget',
    category: 'Food & Dining',
    amount: 850
  },
  {
    id: '2',
    type: 'transaction',
    title: 'Large Transaction Detected',
    message: 'A transaction of K2,500 was recorded at SuperMart',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    priority: 'medium',
    actionUrl: '/transactions',
    actionText: 'View Transaction',
    amount: 2500
  },
  {
    id: '3',
    type: 'bill',
    title: 'Bill Reminder',
    message: 'Your electricity bill (K450) is due in 3 days',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    priority: 'medium',
    actionUrl: '/transactions',
    actionText: 'Pay Now',
    amount: 450
  },
  {
    id: '4',
    type: 'goal',
    title: 'Savings Goal Achievement',
    message: 'Congratulations! You\'ve reached 75% of your vacation savings goal',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    priority: 'low',
    actionUrl: '/dashboard',
    actionText: 'View Goals'
  },
  {
    id: '5',
    type: 'system',
    title: 'Weekly Report Available',
    message: 'Your weekly spending report is ready to view',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    priority: 'low',
    actionUrl: '/analytics',
    actionText: 'View Report'
  }
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { notifications: notificationSettings } = useSettings();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const loadNotifications = () => {
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
        } else {
          // Use initial notifications if none saved
          setNotifications(initialNotifications);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications(initialNotifications);
      }
    };

    loadNotifications();
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [notifications]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // Check if this type of notification is enabled
    const shouldShowNotification = () => {
      switch (notificationData.type) {
        case 'budget':
          return notificationSettings.budgetAlerts;
        case 'transaction':
          return notificationSettings.largeTransactions;
        case 'bill':
          return notificationSettings.billReminders;
        case 'goal':
          return notificationSettings.goalReminders;
        case 'system':
          return notificationSettings.productUpdates;
        case 'security':
          return true; // Always show security notifications
        default:
          return true;
      }
    };

    if (!shouldShowNotification()) {
      return; // Don't add notification if disabled
    }

    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification for high priority items (if push notifications are enabled)
    if (notificationSettings.pushNotifications) {
      if (notificationData.priority === 'high' || notificationData.priority === 'urgent') {
        toast.error(notificationData.title, {
          duration: 5000,
          icon: '🚨'
        });
      } else if (notificationData.priority === 'medium') {
        toast(notificationData.title, {
          duration: 4000,
          icon: '⚠️'
        });
      }
    }
  };

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

// Utility functions for creating common notification types
export const createBudgetAlert = (category: string, spent: number, budget: number, currency: string = 'K') => ({
  type: 'budget' as const,
  title: `Budget Alert: ${category}`,
  message: `You've spent ${Math.round((spent / budget) * 100)}% of your ${category.toLowerCase()} budget (${currency}${spent} of ${currency}${budget})`,
  priority: spent / budget > 0.9 ? 'urgent' as const : spent / budget > 0.8 ? 'high' as const : 'medium' as const,
  actionUrl: '/budgets',
  actionText: 'View Budget',
  category,
  amount: spent
});

export const createTransactionAlert = (amount: number, merchant: string, currency: string = 'K') => ({
  type: 'transaction' as const,
  title: 'Large Transaction Detected',
  message: `A transaction of ${currency}${amount} was recorded at ${merchant}`,
  priority: amount > 5000 ? 'high' as const : 'medium' as const,
  actionUrl: '/transactions',
  actionText: 'View Transaction',
  amount
});

export const createBillReminder = (billName: string, amount: number, daysUntilDue: number, currency: string = 'K') => ({
  type: 'bill' as const,
  title: 'Bill Reminder',
  message: `Your ${billName} bill (${currency}${amount}) is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
  priority: daysUntilDue <= 1 ? 'urgent' as const : daysUntilDue <= 3 ? 'high' as const : 'medium' as const,
  actionUrl: '/transactions',
  actionText: 'Pay Now',
  amount
});

export const createGoalAchievement = (goalName: string, percentage: number) => ({
  type: 'goal' as const,
  title: 'Savings Goal Achievement',
  message: `Congratulations! You've reached ${percentage}% of your ${goalName} goal`,
  priority: percentage >= 100 ? 'high' as const : 'low' as const,
  actionUrl: '/dashboard',
  actionText: 'View Goals'
});