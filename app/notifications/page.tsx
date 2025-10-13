'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';
import toast from 'react-hot-toast';

// Define the filter options clearly
const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'budget', label: 'Budget' },
    { value: 'transaction', label: 'Transaction' },
    { value: 'bill', label: 'Bill' },
    { value: 'goal', label: 'Goal' },
    { value: 'system', label: 'System' },
    { value: 'security', label: 'Security' },
];

// Define the type for the filter state
type FilterType = (typeof filterOptions)[number]['value'];

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllRead 
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'budget' | 'transaction' | 'bill' | 'goal' | 'system' | 'security'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const { formatCurrency } = useSettings();

    const getNotificationIcon = (type: string, priority: string) => {
        const baseClasses = "w-10 h-10 rounded-lg flex items-center justify-center";
        
        switch (type) {
            case 'budget':
                return (
                    <div className={`${baseClasses} ${priority === 'high' || priority === 'urgent' ? 'bg-red-100' : 'bg-orange-100'}`}>
                        <i className={`ri-wallet-3-line ${priority === 'high' || priority === 'urgent' ? 'text-red-600' : 'text-orange-600'}`} aria-hidden="true"></i>
                    </div>
                );
            case 'transaction':
                return (
                    <div className={`${baseClasses} bg-blue-100`}>
                        <i className="ri-exchange-line text-blue-600" aria-hidden="true"></i>
                    </div>
                );
            case 'bill':
                return (
                    <div className={`${baseClasses} bg-yellow-100`}>
                        <i className="ri-bill-line text-yellow-600" aria-hidden="true"></i>
                    </div>
                );
            case 'goal':
                return (
                    <div className={`${baseClasses} bg-green-100`}>
                        <i className="ri-trophy-line text-green-600" aria-hidden="true"></i>
                    </div>
                );
            case 'system':
                return (
                    <div className={`${baseClasses} bg-purple-100`}>
                        <i className="ri-information-line text-purple-600" aria-hidden="true"></i>
                    </div>
                );
            case 'security':
                return (
                    <div className={`${baseClasses} bg-red-100`}>
                        <i className="ri-shield-check-line text-red-600" aria-hidden="true"></i>
                    </div>
                );
            default:
                return (
                    <div className={`${baseClasses} bg-gray-100`}>
                        <i className="ri-notification-3-line text-gray-600" aria-hidden="true"></i>
                    </div>
                );
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Urgent</span>;
            case 'high':
                return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">High</span>;
            case 'medium':
                return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Medium</span>;
            case 'low':
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Low</span>;
            default:
                return null;
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else if (days < 7) {
            return `${days}d ago`;
        } else {
            return timestamp.toLocaleDateString();
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read;
        return notification.type === filter;
    });

    const sortedNotifications = [...filteredNotifications].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return b.timestamp.getTime() - a.timestamp.getTime();
            case 'oldest':
                return a.timestamp.getTime() - b.timestamp.getTime();
            case 'priority':
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            default:
                return 0;
        }
    });

    const handleMarkAllAsRead = () => {
        markAllAsRead();
        toast.success('All notifications marked as read');
    };

    const handleDeleteNotification = (id: string) => {
        deleteNotification(id);
        toast.success('Notification deleted');
    };

    const handleClearAllRead = () => {
        clearAllRead();
        toast.success('All read notifications cleared');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-12">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <i className="ri-notification-3-line text-white text-xl" aria-hidden="true"></i>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-600 text-lg mt-1">
                                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up! Stay informed about your financial activities.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-end">
                        <div className="flex space-x-3">
                            <Button variant="outline" onClick={handleClearAllRead}>
                                <i className="ri-delete-bin-line mr-2" aria-hidden="true"></i>
                                Clear Read
                            </Button>
                            <Button onClick={handleMarkAllAsRead}>
                                <i className="ri-check-double-line mr-2" aria-hidden="true"></i>
                                Mark All Read
                            </Button>
                        </div>
                    </div>

                    {/* Filters and Sort */}
                    <Card className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div className="flex flex-wrap gap-2">
                                {/* MODIFIED: Use the filterOptions constant */}
                                {filterOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFilter(option.value)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            filter === option.value
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {option.label}
                                        {option.value === 'unread' && unreadCount > 0 && (
                                            <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="priority">Priority</option>
                                </select>
                            </div>
                        </div>
                    </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            {sortedNotifications.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-notification-off-line text-2xl text-gray-400" aria-hidden="true"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {filter === 'all' ? 'You\'re all caught up!' : `No ${filter} notifications found.`}
                </p>
              </Card>
            ) : (
              sortedNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 transition-all hover:shadow-md ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {getNotificationIcon(notification.type, notification.priority)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                            {getPriorityBadge(notification.priority)}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            {notification.amount && (
                              <span className="font-medium">{formatCurrency(notification.amount)}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.actionUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                markAsRead(notification.id);
                                // In a real app, you'd navigate to the URL
                                toast.success(`Navigating to ${notification.actionText}`);
                              }}
                            >
                              {notification.actionText}
                            </Button>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                title="Mark as read"
                              >
                                <i className="ri-check-line" aria-hidden="true"></i>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                              title="Delete notification"
                            >
                              <i className="ri-delete-bin-line" aria-hidden="true"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

                    {/* Quick Stats */}
                    {notifications.length > 0 && (
                        <Card className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Notification Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
                                    <div className="text-sm text-gray-600">Unread</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {notifications.filter(n => n.type === 'budget').length}
                                    </div>
                                    <div className="text-sm text-gray-600">Budget Alerts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {notifications.filter(n => n.type === 'bill').length}
                                    </div>
                                    <div className="text-sm text-gray-600">Bill Reminders</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {notifications.filter(n => n.type === 'goal').length}
                                    </div>
                                    <div className="text-sm text-gray-600">Goal Updates</div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}