/**
 * Custom hook for managing user-specific settings with cookies
 */

import { useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { 
  setJSONCookie, 
  getJSONCookie, 
  deleteCookie, 
  getUserCookieName, 
  APPEARANCE_COOKIE_OPTIONS 
} from '@/lib/cookies';

export function useUserSettings() {
  const { user } = useAuth();

  const saveUserSetting = useCallback(<T>(settingName: string, value: T) => {
    if (!user?.id) {
      console.warn('Cannot save user setting: user not logged in');
      return false;
    }

    try {
      const cookieName = getUserCookieName(settingName, user.id);
      setJSONCookie(cookieName, value, APPEARANCE_COOKIE_OPTIONS);
      return true;
    } catch (error) {
      console.error(`Error saving user setting ${settingName}:`, error);
      return false;
    }
  }, [user?.id]);

  const getUserSetting = useCallback(<T>(settingName: string, defaultValue?: T): T | null => {
    if (!user?.id) {
      return defaultValue || null;
    }

    try {
      const cookieName = getUserCookieName(settingName, user.id);
      const value = getJSONCookie<T>(cookieName);
      return value !== null ? value : (defaultValue || null);
    } catch (error) {
      console.error(`Error getting user setting ${settingName}:`, error);
      return defaultValue || null;
    }
  }, [user?.id]);

  const deleteUserSetting = useCallback((settingName: string) => {
    if (!user?.id) {
      console.warn('Cannot delete user setting: user not logged in');
      return false;
    }

    try {
      const cookieName = getUserCookieName(settingName, user.id);
      deleteCookie(cookieName);
      return true;
    } catch (error) {
      console.error(`Error deleting user setting ${settingName}:`, error);
      return false;
    }
  }, [user?.id]);

  const clearAllUserSettings = useCallback(() => {
    if (!user?.id) {
      console.warn('Cannot clear user settings: user not logged in');
      return false;
    }

    try {
      // List of known user settings to clear
      const settingsToClean = ['appearanceSettings'];
      
      settingsToClean.forEach(settingName => {
        const cookieName = getUserCookieName(settingName, user.id);
        deleteCookie(cookieName);
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing user settings:', error);
      return false;
    }
  }, [user?.id]);

  return {
    saveUserSetting,
    getUserSetting,
    deleteUserSetting,
    clearAllUserSettings,
    isLoggedIn: !!user?.id,
    userId: user?.id
  };
}