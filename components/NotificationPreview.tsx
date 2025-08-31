'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications, Notification } from '../app/contexts/NotificationContext';

interface NotificationPreviewProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationPreview({ isVisible, onClose }: NotificationPreviewProps) {
  const { notifications, markAsRead } = useNotifications();
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Get the 4 most recent notifications
    const recent = notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4);
    setRecentNotifications(recent);
  }, [notifications]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const baseClasses = "w-4 h-4 flex-shrink-0";
    
    switch (type) {
      case 'budget':
        return <i className={`ri-wallet-3-line ${baseClasses} ${priority === 'urgent' || priority === 'high' ? 'text-red-500' : 'text-orange-500'}`} />;
      case 'transaction':
        return <i className={`ri-exchange-line ${baseClasses} text-blue-500`} />;
      case 'bill':
        return <i className={`ri-bill-line ${baseClasses} ${priority === 'urgent' ? 'text-red-500' : 'text-yellow-500'}`} />;
      case 'goal':
        return <i className={`ri-trophy-line ${baseClasses} text-green-500`} />;
      case 'system':
        return <i className={`ri-information-line ${baseClasses} text-gray-500`} />;
      case 'security':
        return <i className={`ri-shield-check-line ${baseClasses} text-red-500`} />;
      default:
        return <i className={`ri-notification-3-line ${baseClasses} text-gray-500`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50/50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50/50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50/50';
      default:
        return 'border-l-gray-300 bg-gray-50/50';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-slide-down">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Recent Notifications</h3>
          <span className="text-xs text-gray-500">
            {notifications.filter(n => !n.read).length} unread
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {recentNotifications.length > 0 ? (
          <div className="py-1">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-2 ${getPriorityColor(notification.priority)} ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-xs mt-1 ${!notification.read ? 'text-gray-600' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                        {notification.amount && (
                          <p className="text-xs font-medium text-primary mt-1">
                            K{notification.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <i className="ri-notification-off-line text-3xl text-gray-300 mb-2"></i>
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <Link
          href="/notifications"
          className="block w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}