'use client';

import { useSettings } from '../app/contexts/SettingsContext';
import { useNotifications } from '../app/contexts/NotificationContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import toast from 'react-hot-toast';

export default function SettingsTestPanel() {
  const { appearance, notifications: notificationSettings, budgetPreferences, formatCurrency } = useSettings();
  const { addNotification } = useNotifications();

  const testNotifications = () => {
    // Test different types of notifications
    const testNotificationTypes = [
      {
        type: 'budget' as const,
        title: 'Budget Alert Test',
        message: 'This is a test budget alert',
        priority: 'high' as const
      },
      {
        type: 'transaction' as const,
        title: 'Transaction Alert Test',
        message: 'This is a test transaction alert',
        priority: 'medium' as const
      },
      {
        type: 'bill' as const,
        title: 'Bill Reminder Test',
        message: 'This is a test bill reminder',
        priority: 'high' as const
      },
      {
        type: 'goal' as const,
        title: 'Goal Achievement Test',
        message: 'This is a test goal achievement',
        priority: 'low' as const
      },
      {
        type: 'system' as const,
        title: 'System Update Test',
        message: 'This is a test system update',
        priority: 'low' as const
      }
    ];

    testNotificationTypes.forEach((notification, index) => {
      setTimeout(() => {
        addNotification(notification);
      }, index * 1000);
    });

    toast.success('Testing notifications based on your settings!');
  };

  const testCurrencyFormatting = () => {
    const testAmounts = [123.45, 1234.56, 12345.67, -567.89, 0];
    
    testAmounts.forEach((amount, index) => {
      setTimeout(() => {
        toast.success(`Test Amount: ${formatCurrency(amount)}`);
      }, index * 500);
    });
  };

  return (
    <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <i className="ri-settings-3-line text-white" aria-hidden="true"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Settings Test Panel</h3>
          <p className="text-sm text-gray-600">Test your current settings configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Settings Display */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Current Settings</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Theme:</span>
              <span className="font-medium capitalize">{appearance.theme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Color Scheme:</span>
              <span className="font-medium capitalize">{appearance.colorScheme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Font Size:</span>
              <span className="font-medium capitalize">{appearance.fontSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Compact Mode:</span>
              <span className="font-medium">{appearance.compactMode ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Animations:</span>
              <span className="font-medium">{appearance.animations ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{budgetPreferences.currency} ({budgetPreferences.currencySymbol})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency Position:</span>
                <span className="font-medium capitalize">{budgetPreferences.currencyPosition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Decimal Places:</span>
                <span className="font-medium">{budgetPreferences.decimalPlaces}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Notification Settings</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Push Notifications:</span>
              <span className={`font-medium ${notificationSettings.pushNotifications ? 'text-green-600' : 'text-red-600'}`}>
                {notificationSettings.pushNotifications ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Budget Alerts:</span>
              <span className={`font-medium ${notificationSettings.budgetAlerts ? 'text-green-600' : 'text-red-600'}`}>
                {notificationSettings.budgetAlerts ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Large Transactions:</span>
              <span className={`font-medium ${notificationSettings.largeTransactions ? 'text-green-600' : 'text-red-600'}`}>
                {notificationSettings.largeTransactions ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bill Reminders:</span>
              <span className={`font-medium ${notificationSettings.billReminders ? 'text-green-600' : 'text-red-600'}`}>
                {notificationSettings.billReminders ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Goal Reminders:</span>
              <span className={`font-medium ${notificationSettings.goalReminders ? 'text-green-600' : 'text-red-600'}`}>
                {notificationSettings.goalReminders ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-blue-200">
        <Button
          onClick={testNotifications}
          variant="outline"
          size="sm"
        >
          <i className="ri-notification-3-line mr-2" aria-hidden="true"></i>
          Test Notifications
        </Button>
        
        <Button
          onClick={testCurrencyFormatting}
          variant="outline"
          size="sm"
        >
          <i className="ri-money-dollar-circle-line mr-2" aria-hidden="true"></i>
          Test Currency Format
        </Button>

        <Button
          onClick={() => {
            toast.success('Settings are working correctly!', {
              duration: 3000,
              icon: '✅'
            });
          }}
          variant="outline"
          size="sm"
        >
          <i className="ri-check-line mr-2" aria-hidden="true"></i>
          Test Toast
        </Button>
      </div>

      {/* Sample Currency Display */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
        <h5 className="text-sm font-medium text-gray-900 mb-2">Currency Format Preview:</h5>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>Small: {formatCurrency(123.45)}</span>
          <span>Medium: {formatCurrency(1234.56)}</span>
          <span>Large: {formatCurrency(12345.67)}</span>
          <span className="text-red-600">Negative: {formatCurrency(-567.89)}</span>
        </div>
      </div>
    </Card>
  );
}