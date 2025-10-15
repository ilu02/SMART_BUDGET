'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    loading: boolean;
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
    phone: '+260 ',
    timezone: 'Central Africa Time',
    language: 'English',
    currency: 'ZMW - Zambian Kwacha (ZK)',
    profilePicture: undefined,
    currencySymbol: 'K',
    currencyCode: 'ZMW'
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
    const [loading, setLoading] = useState(true);

    const getUserLocalStorageKey = (key: string) => user?.id ? `${key}_${user.id}` : key;

    const parseUserName = (name: string) => {
        if (!name) return { firstName: 'John', lastName: 'Doe' };
        const parts = name.trim().split(' ');
        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' ')
        };
    };

    const loadUserProfileFromDatabase = async (userId: string) => {
        try {
            const response = await fetch(`/api/user/profile?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                return data.user || null;
            }
            return null;
        } catch (error) {
            console.error('Error loading user profile from database:', error);
            return null;
        }
    };

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);
            try {
                // Appearance from cookies
                const appearanceCookie = getJSONCookie<AppearanceSettings>(
                    getUserCookieName('appearanceSettings', user?.id)
                );
                if (appearanceCookie) setAppearance(prev => ({ ...prev, ...appearanceCookie }));

                // Notifications, budgetPreferences, profile from user-specific localStorage
                const savedNotifications = localStorage.getItem(getUserLocalStorageKey('notificationSettings'));
                if (savedNotifications) setNotifications(prev => ({ ...prev, ...JSON.parse(savedNotifications) }));

                const savedBudgetPrefs = localStorage.getItem(getUserLocalStorageKey('budgetPreferences'));
                if (savedBudgetPrefs) setBudgetPreferences(prev => ({ ...prev, ...JSON.parse(savedBudgetPrefs) }));

                const savedProfile = localStorage.getItem(getUserLocalStorageKey('profileSettings'));

                // Load from database if user exists
                if (user?.id) {
                    const dbUser = await loadUserProfileFromDatabase(user.id);
                    if (dbUser) {
                        const nameParts = parseUserName(dbUser.name);
                        const dbProfile: ProfileSettings = {
                            firstName: nameParts.firstName,
                            lastName: nameParts.lastName,
                            email: dbUser.email || defaultProfile.email,
                            phone: dbUser.phone || defaultProfile.phone,
                            timezone: dbUser.timezone || defaultProfile.timezone,
                            language: dbUser.language || defaultProfile.language,
                            currency: dbUser.currency || defaultProfile.currency,
                            currencySymbol: dbUser.currencySymbol || defaultProfile.currencySymbol,
                            currencyCode: dbUser.currencyCode || defaultProfile.currencyCode,
                            profilePicture: dbUser.avatar || defaultProfile.profilePicture
                        };
                        setProfile(dbProfile);
                        localStorage.setItem(getUserLocalStorageKey('profileSettings'), JSON.stringify(dbProfile));
                    } else if (savedProfile) {
                        setProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
                    }
                } else if (savedProfile) {
                    setProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [user?.id]);

    // --- Update functions ---
    const updateAppearance = (settings: Partial<AppearanceSettings>) => setAppearance(prev => ({ ...prev, ...settings }));
    const updateNotifications = (settings: Partial<NotificationSettings>) => setNotifications(prev => ({ ...prev, ...settings }));
    const updateBudgetPreferences = (settings: Partial<BudgetPreferences>) => setBudgetPreferences(prev => ({ ...prev, ...settings }));
    const updateProfile = (settings: Partial<ProfileSettings>) => setProfile(prev => ({ ...prev, ...settings }));

    // --- Persistence ---
    useEffect(() => {
        if (user?.id) {
            try {
                setJSONCookie(getUserCookieName('appearanceSettings', user.id), appearance, APPEARANCE_COOKIE_OPTIONS);
            } catch (error) { console.error(error); }
        }
    }, [appearance, user?.id]);

    useEffect(() => {
        if (!user?.id) return;
        try {
            localStorage.setItem(getUserLocalStorageKey('notificationSettings'), JSON.stringify(notifications));
            localStorage.setItem(getUserLocalStorageKey('budgetPreferences'), JSON.stringify(budgetPreferences));
            localStorage.setItem(getUserLocalStorageKey('profileSettings'), JSON.stringify(profile));
        } catch (error) {
            console.error(error);
        }
    }, [notifications, budgetPreferences, profile, user?.id]);

    const formatCurrency = (amount: number) => {
        const { currencySymbol, currencyPosition, decimalPlaces, thousandsSeparator, decimalSeparator } = budgetPreferences;
        const absAmount = Math.abs(amount);
        const parts = absAmount.toFixed(decimalPlaces).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
        const formatted = parts.join(decimalSeparator);
        return amount < 0 ? `-${currencyPosition === 'before' ? currencySymbol + formatted : formatted + currencySymbol}`
                          : currencyPosition === 'before' ? currencySymbol + formatted : formatted + currencySymbol;
    };

    const getCurrencySymbol = () => budgetPreferences.currencySymbol;

    const resetSettings = () => {
        setAppearance(defaultAppearance);
        setNotifications(defaultNotifications);
        setBudgetPreferences(defaultBudgetPreferences);
        setProfile(defaultProfile);

        if (user?.id) {
            deleteCookie(getUserCookieName('appearanceSettings', user.id));
            localStorage.removeItem(getUserLocalStorageKey('notificationSettings'));
            localStorage.removeItem(getUserLocalStorageKey('budgetPreferences'));
            localStorage.removeItem(getUserLocalStorageKey('profileSettings'));
        }
    };

    const clearUserSettings = () => {
        setAppearance(defaultAppearance);
        if (user?.id) deleteCookie(getUserCookieName('appearanceSettings', user.id));
    };

    useEffect(() => {
        if (!user) setProfile(defaultProfile);
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
                getCurrencySymbol,
                loading
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
}
