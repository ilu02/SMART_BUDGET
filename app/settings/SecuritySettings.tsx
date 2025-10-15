
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export default function SecuritySettings() {
  const { user } = useAuth();
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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordChangedAt, setPasswordChangedAt] = useState<Date | null>(null);

  // Fetch user profile to get passwordChangedAt
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/user/profile?userId=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.user.passwordChangedAt) {
          setPasswordChangedAt(new Date(data.user.passwordChangedAt));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

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

  // Password validation
  const getPasswordRequirements = (password: string): PasswordRequirement[] => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One lowercase letter', met: /[a-z]/.test(password) },
      { label: 'One number', met: /[0-9]/.test(password) },
      { label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
  };

  const passwordRequirements = getPasswordRequirements(passwords.new);
  const isPasswordValid = passwordRequirements.every(req => req.met);

  // Format time since password was changed
  const getTimeSincePasswordChange = () => {
    if (!passwordChangedAt) return 'Never changed';

    const now = new Date();
    const diffMs = now.getTime() - passwordChangedAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffMonths === 1) return '1 month ago';
    if (diffMonths < 12) return `${diffMonths} months ago`;
    if (diffYears === 1) return '1 year ago';
    return `${diffYears} years ago`;
  };

  const handlePasswordChange = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    if (!passwords.current) {
      toast.error('Please enter your current password');
      return;
    }

    if (!passwords.new) {
      toast.error('Please enter a new password');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Password does not meet all requirements');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwords.current,
          newPassword: passwords.new
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password updated successfully!');
        setShowChangePassword(false);
        setPasswords({ current: '', new: '', confirm: '' });
        // Update the passwordChangedAt to now
        setPasswordChangedAt(new Date());
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Here you would save security settings to the backend
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Security settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeSession = (sessionId: number) => {
    // Handle session revocation
    console.log('Revoking session:', sessionId);
    toast.success('Session revoked successfully');
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
              <p className="text-sm text-gray-500">Last changed {getTimeSincePasswordChange()}</p>
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
                  placeholder="Enter current password"
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
                  placeholder="Enter new password"
                />
                {passwords.new && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700">Password Requirements:</p>
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        {req.met ? (
                          <i className="ri-checkbox-circle-fill text-green-500"></i>
                        ) : (
                          <i className="ri-checkbox-blank-circle-line text-gray-400"></i>
                        )}
                        <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
                  placeholder="Confirm new password"
                />
                {passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !isPasswordValid || passwords.new !== passwords.confirm}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap flex items-center"
                >
                  {isChangingPassword && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswords({ current: '', new: '', confirm: '' });
                  }}
                  disabled={isChangingPassword}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap hover:bg-gray-50 disabled:opacity-50"
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
        <button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium cursor-pointer whitespace-nowrap flex items-center"
        >
          {isSaving && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
