
'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import BudgetPreferences from './BudgetPreferences';
import SecuritySettings from './SecuritySettings';
import AppearanceSettings from './AppearanceSettings';
import DataSettings from './DataSettings';
import SettingsTestPanel from '../../components/SettingsTestPanel';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: 'ri-user-3-line' },
    { id: 'notifications', name: 'Notifications', icon: 'ri-notification-3-line' },
    { id: 'budget', name: 'Budget Preferences', icon: 'ri-wallet-3-line' },
    { id: 'security', name: 'Security', icon: 'ri-shield-check-line' },
    { id: 'appearance', name: 'Appearance', icon: 'ri-palette-line' },
    { id: 'data', name: 'Data & Privacy', icon: 'ri-database-2-line' },
    { id: 'help', name: 'Help & Tutorial', icon: 'ri-question-line' }
  ];

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'budget':
        return <BudgetPreferences />;
      case 'security':
        return <SecuritySettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'data':
        return <DataSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and app settings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 settings-sidebar">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${tab.icon} text-lg`}></i>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 settings-content">
              <SettingsTestPanel />
              {renderActiveContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
