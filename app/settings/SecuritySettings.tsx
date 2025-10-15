
'use client';

import { useState } from 'react';

export default function SecuritySettings() {
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    biometricEnabled: true,
    sessionTimeout: 30,
    loginNotifications: true
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const sessions = [
    {
      id: 1,
      device: 'MacBook Pro',
      location: 'New York, NY',
      lastActive: '2 minutes ago',
      current: true,
      browser: 'Chrome'
    },
    {
      id: 2,
      device: 'iPhone 14',
      location: 'New York, NY',
      lastActive: '1 hour ago',
      current: false,
      browser: 'Safari'
    },
    {
      id: 3,
      device: 'iPad Air',
      location: 'Boston, MA',
      lastActive: '2 days ago',
      current: false,
      browser: 'Safari'
    }
  ];

  const handlePasswordChange = () => {
    if (passwords.new === passwords.confirm) {
      // Handle password change
      setShowChangePassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  const handleRevokeSession = (sessionId: number) => {
    // Handle session revocation
    console.log('Revoking session:', sessionId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account security and privacy</p>
      </div>

      {/* Password Settings */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Password & Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-500">Last changed 3 months ago</p>
            </div>
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap hover:bg-gray-50"
            >
              Change Password
            </button>
          </div>

          {showChangePassword && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePasswordChange}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Session Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={0}>Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap">
          Save Changes
        </button>
      </div>
    </div>
  );
}
