'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  setJSONCookie,
  getJSONCookie,
  deleteCookie,
  getUserCookieName,
  APPEARANCE_COOKIE_OPTIONS
} from '@/lib/cookies';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  animations: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'amber' | 'emerald';
  customPrimaryColor?: string;
  layout: 'default' | 'wide' | 'centered';
  cardStyle: 'default' | 'sharp' | 'rounded' | 'pill';
  sidebarPosition: 'left' | 'right';
  sidebarCollapsed: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  budgetAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  goalReminders: boolean;
  billReminders: boolean;
  largeTransactions: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
}

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
  language: string;
  currency: string;
  profilePicture?: string;
  currencySymbol?: string;
  currencyCode?: string;
}

interface BudgetPreferences {
  defaultBudgetPeriod: 'weekly' | 'monthly' | 'yearly';
  rolloverUnused: boolean;
  warningThreshold: number;
  autoSavePercentage: number;
  roundUpTransactions: boolean;
  categorizeTransactions: boolean;
  defaultCategories: string[];
  currency: string;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: ',' | '.' | ' ';
  decimalSeparator: '.' | ',';
}

interface SettingsContextType {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  budgetPreferences: BudgetPreferences;
  profile: ProfileSettings;
  updateAppearance: (settings: Partial<AppearanceSettings>) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateBudgetPreferences: (settings: Partial<BudgetPreferences>) => void;
  updateProfile: (settings: Partial<ProfileSettings>) => void;
  resetSettings: () => void;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  clearUserSettings: () => void;
  currencySymbol: string;
}

const defaultAppearance: AppearanceSettings = {
  theme: 'light',
  compactMode: false,
  animations: true,
  fontSize: 'medium',
  colorScheme: 'blue',
  customPrimaryColor: undefined,
  layout: 'default',
  cardStyle: 'default',
  sidebarPosition: 'left',
  sidebarCollapsed: false
};

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  budgetAlerts: true,
  weeklyReports: true,
  monthlyReports: true,
  goalReminders: false,
  billReminders: true,
  largeTransactions: true,
  marketingEmails: false,
  productUpdates: true
};

const defaultProfile: ProfileSettings = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  timezone: 'Eastern Time',
  language: 'English',
  currency: 'USD - US Dollar ($)',
  profilePicture: undefined,
  currencySymbol: '$',
  currencyCode: 'USD'
};

const defaultBudgetPreferences: BudgetPreferences = {
  defaultBudgetPeriod: 'monthly',
  rolloverUnused: true,
  warningThreshold: 80,
  autoSavePercentage: 10,
  roundUpTransactions: false,
  categorizeTransactions: true,
  defaultCategories: ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping'],
  currency: 'ZMW',
  currencySymbol: 'K',
  currencyPosition: 'before',
  decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [budgetPreferences, setBudgetPreferences] = useState<BudgetPreferences>(defaultBudgetPreferences);
  const [profile, setProfile] = useState<ProfileSettings>(defaultProfile);

  // Load settings on mount and when user changes
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load appearance settings from cookies (user-specific)
        const userAppearanceCookieName = getUserCookieName('appearanceSettings', user?.id);
        const savedAppearance = getJSONCookie<AppearanceSettings>(userAppearanceCookieName);

        if (savedAppearance) {
          setAppearance({
            ...defaultAppearance,
            ...savedAppearance
          });
        } else {
          const legacyAppearance = localStorage.getItem('appearanceSettings');
          if (legacyAppearance) {
            try {
              const parsed = JSON.parse(legacyAppearance);
              setAppearance({
                ...defaultAppearance,
                ...parsed
              });
              if (user?.id) {
                setJSONCookie(userAppearanceCookieName, parsed, APPEARANCE_COOKIE_OPTIONS);
              }
              localStorage.removeItem('appearanceSettings');
            } catch (e) {
              console.error('Error migrating legacy appearance settings:', e);
            }
          }
        }

        const savedNotifications = localStorage.getItem('notificationSettings');
        const savedBudgetPreferences = localStorage.getItem('budgetPreferences');
        const savedProfile = localStorage.getItem('profileSettings');

        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
        if (savedBudgetPreferences) {
          const parsed = JSON.parse(savedBudgetPreferences);
          setBudgetPreferences({
            ...defaultBudgetPreferences,
            ...parsed
          });
        }
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfile({
            ...defaultProfile,
            ...parsed
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setProfile(prevProfile => ({
        ...prevProfile,
        firstName: user.name?.split(' ')[0] || prevProfile.firstName,
        lastName: user.name?.split(' ').slice(1).join(' ') || prevProfile.lastName,
        email: user.email || prevProfile.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      try {
        const userAppearanceCookieName = getUserCookieName('appearanceSettings', user.id);
        setJSONCookie(userAppearanceCookieName, appearance, APPEARANCE_COOKIE_OPTIONS);
      } catch (error) {
        console.error('Error saving appearance settings to cookies:', error);
      }
    }
  }, [appearance, user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      localStorage.setItem('budgetPreferences', JSON.stringify(budgetPreferences));
      localStorage.setItem('profileSettings', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [notifications, budgetPreferences, profile]);

  const formatCurrency = (amount: number): string => {
    const { currencySymbol, currencyPosition, decimalPlaces, thousandsSeparator, decimalSeparator } = budgetPreferences;

    const absAmount = Math.abs(amount);
    const parts = absAmount.toFixed(decimalPlaces).split('.');
    
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    
    const formattedNumber = parts.join(decimalSeparator);
    
    const formattedAmount = currencyPosition === 'before'
      ? `${currencySymbol}${formattedNumber}`
      : `${formattedNumber}${currencySymbol}`;

    return amount < 0 ? `-${formattedAmount}` : formattedAmount;
  };

  // Add this function to return the currency symbol based on budget preferences
  const getCurrencySymbol = (): string => {
    return budgetPreferences.currencySymbol;
  };

  const updateAppearance = (settings: Partial<AppearanceSettings>) => {
    setAppearance(prev => ({ ...prev, ...settings }));
  };

  const updateNotifications = (settings: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...settings }));
  };

  const updateBudgetPreferences = (settings: Partial<BudgetPreferences>) => {
    setBudgetPreferences(prev => ({ ...prev, ...settings }));
  };

  const updateProfile = (settings: Partial<ProfileSettings>) => {
    setProfile(prev => ({ ...prev, ...settings }));
  };

  const resetSettings = () => {
    setAppearance(defaultAppearance);
    setNotifications(defaultNotifications);
    setBudgetPreferences(defaultBudgetPreferences);
    setProfile(defaultProfile);
    
    if (user?.id) {
      const userAppearanceCookieName = getUserCookieName('appearanceSettings', user.id);
      deleteCookie(userAppearanceCookieName);
    }
    
    localStorage.removeItem('notificationSettings');
    localStorage.removeItem('budgetPreferences');
    localStorage.removeItem('profileSettings');
    
    localStorage.removeItem('appearanceSettings');
  };

  const clearUserSettings = () => {
    setAppearance(defaultAppearance);
    
    if (user?.id) {
      const userAppearanceCookieName = getUserCookieName('appearanceSettings', user.id);
      deleteCookie(userAppearanceCookieName);
    }
  };

  useEffect(() => {
    if (!user) {
      setAppearance(defaultAppearance);
    }
  }, [user]);

  return (
    <SettingsContext.Provider
      value={{
        appearance,
        notifications,
        budgetPreferences,
        profile,
        updateAppearance,
        updateNotifications,
        updateBudgetPreferences,
        updateProfile,
        resetSettings,
        formatCurrency,
        clearUserSettings,
        currencySymbol: budgetPreferences.currencySymbol,
        getCurrencySymbol
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}