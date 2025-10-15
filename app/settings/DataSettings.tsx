'use client';

import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function DataSettings() {
  const { notifications, updateNotifications } = useSettings();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const dataOptions = [
    {
      title: 'Export Your Data',
      description: 'Download all your financial data in CSV or JSON format',
      action: 'Export',
      icon: 'ri-download-2-line',
      color: 'bg-blue-600 hover:bg-blue-700'
    }
  ];

  const privacySettings = [
    {
      id: 'marketingEmails',
      title: 'Marketing Communications',
      description: 'Receive tips, feature updates, and promotional content',
    },
    {
      id: 'productUpdates',
      title: 'Product Updates',
      description: 'Stay informed about new features and improvements',
    }
  ];

  const handleExport = (format: string) => {
    console.log(`Exporting data in ${format} format`);
    toast.success(`Data exported in ${format.toUpperCase()} format`);
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          password: deletePassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account deleted successfully');
        setShowDeleteModal(false);
        setDeletePassword('');
        
        // Log out and redirect to login
        setTimeout(() => {
          logout();
          router.push('/auth/login');
        }, 1000);
      } else {
        toast.error(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  const PrivacyToggle = ({ id, title, description, enabled }: {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={() => updateNotifications({ [id]: !enabled })}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data & Privacy</h2>
        <p className="text-gray-600 mt-1">Manage your data, privacy settings, and account</p>
      </div>

      {/* Data Management */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Data Management</h3>
        <div className="grid grid-cols-1 gap-4">
          {dataOptions.map((option) => (
            <div key={option.title} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${option.color.split(' ')[0]}`}>
                    <i className={`${option.icon} text-white text-lg`} aria-hidden="true"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{option.title}</h4>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (option.action === 'Export') handleExport('csv');
                  }}
                  className={`${option.color} text-white px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap`}
                >
                  {option.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export Options */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Export Options</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleExport('csv')}
            className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg font-medium cursor-pointer hover:bg-gray-50 text-left"
          >
            <div className="flex items-center space-x-3">
              <i className="ri-file-text-line text-xl text-gray-600" aria-hidden="true"></i>
              <div>
                <h4 className="font-medium">CSV Format</h4>
                <p className="text-sm text-gray-500">Compatible with Excel and Google Sheets</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg font-medium cursor-pointer hover:bg-gray-50 text-left"
          >
            <div className="flex items-center space-x-3">
              <i className="ri-code-line text-xl text-gray-600" aria-hidden="true"></i>
              <div>
                <h4 className="font-medium">JSON Format</h4>
                <p className="text-sm text-gray-500">Raw data format for developers</p>
              </div>
            </div>
          </button>
        </div>
      </div>
      {/* Account Actions */}
      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <h3 className="font-semibold text-red-900 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-error-warning-line text-red-600 text-xl" aria-hidden="true"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data, including transactions, budgets, and settings will be permanently deleted.
            </p>
            <p className="text-sm text-gray-700 font-medium mb-2">
              Enter your password to confirm:
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
              placeholder="Enter your password"
              disabled={isDeleting}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                disabled={isDeleting}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-gray-50 whitespace-nowrap disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword || isDeleting}
                className={`flex-1 px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap flex items-center justify-center ${
                  deletePassword && !isDeleting
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isDeleting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSaveSettings}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}