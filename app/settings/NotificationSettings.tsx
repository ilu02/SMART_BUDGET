'use client';

import { useSettings } from '../contexts/SettingsContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

const notificationGroups = [
  {
    title: 'General Notifications',
    description: 'Basic app notifications and alerts',
    settings: [
      { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
      { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications in your browser' }
    ]
  },
  {
    title: 'Budget & Spending',
    description: 'Alerts related to your budgets and spending',
    settings: [
      { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Get notified when approaching budget limits' },
      { key: 'largeTransactions', label: 'Large Transactions', description: 'Alert for transactions over $500' }
    ]
  },
  {
    title: 'Reports & Reminders',
    description: 'Periodic reports and helpful reminders',
    settings: [
      { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly spending summary via email' },
      { key: 'monthlyReports', label: 'Monthly Reports', description: 'Monthly financial overview' },
      { key: 'goalReminders', label: 'Goal Reminders', description: 'Reminders about your financial goals' },
      { key: 'billReminders', label: 'Bill Reminders', description: 'Upcoming bill payment reminders' }
    ]
  },
  {
    title: 'Marketing & Updates',
    description: 'Product updates and promotional content',
    settings: [
      { key: 'productUpdates', label: 'Product Updates', description: 'New features and app improvements' },
      { key: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional offers and tips' }
    ]
  }
];

export default function NotificationSettings() {
  const { notifications, updateNotifications } = useSettings();

  const handleToggle = (key: string) => {
    const newValue = !notifications[key as keyof typeof notifications];
    updateNotifications({ [key]: newValue });
    toast.success(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleEnableAll = () => {
    const allEnabled = Object.keys(notifications).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as any);
    updateNotifications(allEnabled);
    toast.success('All notifications enabled');
  };

  const handleDisableAll = () => {
    const allDisabled = Object.keys(notifications).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as any);
    updateNotifications(allDisabled);
    toast.success('All notifications disabled');
  };

  const enabledCount = Object.values(notifications).filter(Boolean).length;
  const totalCount = Object.keys(notifications).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
          <p className="text-gray-600">
            Manage your notification preferences ({enabledCount} of {totalCount} enabled)
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleDisableAll}>
            Disable All
          </Button>
          <Button onClick={handleEnableAll}>
            Enable All
          </Button>
        </div>
      </div>

      {/* Notification Test */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i className="ri-notification-3-line text-blue-600" aria-hidden="true"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Test Notifications</h3>
            <p className="text-blue-800 text-sm mb-4">
              Make sure your notifications are working properly by sending a test notification.
            </p>
            <Button
              size="sm"
              onClick={() => {
                if (notifications.pushNotifications) {
                  toast.success('Test notification sent! 🎉');
                } else {
                  toast.error('Push notifications are disabled. Enable them first.');
                }
              }}
            >
              Send Test Notification
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Groups */}
      {notificationGroups.map((group, groupIndex) => (
        <Card key={groupIndex} className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.title}</h3>
            <p className="text-gray-600 text-sm">{group.description}</p>
          </div>

          <div className="space-y-4">
            {group.settings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{setting.label}</h4>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(setting.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notifications[setting.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications[setting.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Notification Schedule */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours Start
            </label>
            <input
              type="time"
              defaultValue="22:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours End
            </label>
            <input
              type="time"
              defaultValue="08:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          During quiet hours, only urgent notifications will be sent.
        </p>
      </Card>

      {/* Notification Channels */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-mail-line text-blue-600" aria-hidden="true"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-sm text-gray-500">user@example.com</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              notifications.emailNotifications 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {notifications.emailNotifications ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-smartphone-line text-purple-600" aria-hidden="true"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-500">Browser notifications</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              notifications.pushNotifications 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {notifications.pushNotifications ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}