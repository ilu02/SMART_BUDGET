'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  setJSONCookie, 
  getJSONCookie, 
  deleteCookie, 
  getUserCookieName, 
  APPEARANCE_COOKIE_OPTIONS 
} from '@/lib/cookies';

export default function TestCookiesPage() {
  const { user } = useAuth();
  const { appearance, updateAppearance } = useSettings();
  const [testResult, setTestResult] = useState<string>('');
  const [authDebugInfo, setAuthDebugInfo] = useState<any>(null);

  const testCookieFunctionality = () => {
    if (!user?.id) {
      setTestResult('❌ No user logged in - cannot test user-specific cookies');
      return;
    }

    try {
      // Test data
      const testData = { theme: 'dark', fontSize: 'large', language: 'en' };
      const cookieName = getUserCookieName('testSettings', user.id);

      // Test 1: Set cookie
      setJSONCookie(cookieName, testData, APPEARANCE_COOKIE_OPTIONS);
      
      // Test 2: Get cookie
      const retrieved = getJSONCookie(cookieName);
      
      if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
        setTestResult('✅ Cookie functionality working correctly!');
      } else {
        setTestResult('❌ Cookie data mismatch');
      }

      // Clean up test cookie
      deleteCookie(cookieName);
      
    } catch (error) {
      setTestResult(`❌ Error testing cookies: ${error}`);
    }
  };

  const testAppearanceSettings = () => {
    // Test changing theme
    const newTheme = appearance.theme === 'light' ? 'dark' : 'light';
    updateAppearance({ theme: newTheme });
    setTestResult(`✅ Changed theme to ${newTheme}. Check if it persists after page refresh!`);
  };

  const clearAllAuthData = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('notifications');
      localStorage.removeItem('transactions');
      localStorage.removeItem('settings');
      
      // Clear all cookies by setting them to expire
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      // Clear any appearance cookies if they exist
      if (user?.id) {
        const appearanceCookieName = getUserCookieName('appearanceSettings', user.id);
        deleteCookie(appearanceCookieName);
      }
      
      setTestResult('✅ All authentication data cleared! Refresh the page to see the login screen.');
    } catch (error) {
      setTestResult(`❌ Error clearing auth data: ${error}`);
    }
  };

  const checkAuthData = () => {
    try {
      const localStorageUser = localStorage.getItem('user');
      const localStorageToken = localStorage.getItem('authToken');
      
      // Check cookies
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];
      
      const debugInfo = {
        localStorage: {
          user: localStorageUser ? JSON.parse(localStorageUser) : null,
          authToken: localStorageToken,
        },
        cookies: {
          authToken: cookieToken,
        },
        contextUser: user,
      };
      
      setAuthDebugInfo(debugInfo);
      setTestResult('✅ Auth data retrieved - check the debug info below');
    } catch (error) {
      setTestResult(`❌ Error checking auth data: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Functionality Test</h1>
          <p className="text-gray-600">Test the new user-specific appearance settings with cookies</p>
        </div>

        <div className="grid gap-6">
          {/* User Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            {user ? (
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Is Demo:</strong> {user.isDemo ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <p className="text-red-600">No user logged in</p>
            )}
          </Card>

          {/* Current Appearance Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Appearance Settings</h2>
            <div className="space-y-2">
              <p><strong>Theme:</strong> {appearance.theme}</p>
              <p><strong>Font Size:</strong> {appearance.fontSize}</p>
              <p><strong>Compact Mode:</strong> {appearance.compactMode ? 'Yes' : 'No'}</p>
              <p><strong>Animations:</strong> {appearance.animations ? 'Yes' : 'No'}</p>
            </div>
          </Card>

          {/* Test Buttons */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tests</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <Button onClick={testCookieFunctionality} className="mr-4">
                    Test Cookie Functionality
                  </Button>
                  <Button onClick={testAppearanceSettings} variant="outline">
                    Test Appearance Settings
                  </Button>
                </div>
                <div>
                  <Button onClick={checkAuthData} className="mr-4">
                    🔍 Check Auth Data
                  </Button>
                  <Button onClick={clearAllAuthData} variant="danger">
                    🗑️ Clear All Auth Data (Force Logout)
                  </Button>
                </div>
              </div>
              
              {testResult && (
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="font-mono text-sm">{testResult}</p>
                </div>
              )}

              {authDebugInfo && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Authentication Debug Info:</h3>
                  <pre className="text-xs overflow-auto bg-white p-3 rounded border">
                    {JSON.stringify(authDebugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. <strong>Cookie Functionality Test:</strong> Tests basic cookie set/get/delete operations</p>
              <p>2. <strong>Appearance Settings Test:</strong> Changes theme and tests persistence</p>
              <p>3. <strong>Manual Test:</strong> Change appearance settings, refresh the page, and verify they persist</p>
              <p>4. <strong>Multi-User Test:</strong> Log in as different users and verify settings are user-specific</p>
              <p>5. <strong>Cross-Device Test:</strong> Log in from different browsers/devices with the same account</p>
            </div>
          </Card>

          {/* Cookie Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cookie Information</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Cookie Name Pattern:</strong> appearanceSettings_[userId]</p>
              <p><strong>Expiry:</strong> 365 days</p>
              <p><strong>Secure:</strong> HTTPS only in production</p>
              <p><strong>SameSite:</strong> Lax</p>
              <p><strong>Path:</strong> / (entire site)</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}