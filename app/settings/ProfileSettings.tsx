'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

const timezones = [
    'Eastern Time',
    'Central Time',
    'Mountain Time',
    'Pacific Time',
    'GMT',
    'Central Africa Time',
];

const languages = ['English', 'Spanish', 'French', 'German', 'Mandarin'];

const currencies = [
    'USD - US Dollar ($)',
    'EUR - Euro (€)',
    'GBP - British Pound (£)',
    'ZAR - South African Rand (R)',
    'ZMW - Zambian Kwacha (ZK)',
    'BWP - Botswana Pula (P)',
    'NAD - Namibian Dollar (N$)',
];

export default function ProfileSettings() {
    const [isEditing, setIsEditing] = useState(false);
    const [originalProfile, setOriginalProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const { profile, updateProfile, updateBudgetPreferences, loading } = useSettings();
    const { user, updateProfile: updateUserProfile } = useAuth();
    const [toastShown, setToastShown] = useState(false);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <i className="ri-user-unfollow-line text-6xl text-gray-400 mb-4"></i>
                    <h2 className="text-xl font-semibold text-gray-700">Authentication Required</h2>
                    <p className="text-gray-500 mt-2">Please log in to access profile settings.</p>
                </div>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateProfile({ [name]: value });
    };

    const parseUserName = (name: string) => {
        if (!name) return { firstName: 'John', lastName: 'Doe' };
        const parts = name.trim().split(' ');
        if (parts.length === 1) return { firstName: parts[0], lastName: '' };
        return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
    };

    const handleSave = async () => {
        if (saving) return;

        if (!profile.firstName.trim() || !profile.lastName.trim()) {
            toast.error('First name and last name are required');
            return;
        }

        if (!profile.email.trim()) {
            toast.error('Email address is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setSaving(true);
        setToastShown(false);

        try {
            const profileData = {
                userId: user.id,
                name: `${profile.firstName} ${profile.lastName}`.trim(),
                email: profile.email,
                avatar: profile.profilePicture,
                phone: profile.phone || '',
                timezone: profile.timezone || 'Central Africa Time',
                language: 'English',
                currency: 'ZMW - Zambian Kwacha (ZK)',
                currencySymbol: 'K',
                currencyCode: 'ZMW'
            };

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (response.ok) {
                if (updateUserProfile) updateUserProfile(data.user);

                const nameParts = parseUserName(data.user.name);
                const updatedProfile = {
                    firstName: nameParts.firstName,
                    lastName: nameParts.lastName,
                    email: data.user.email,
                    phone: data.user.phone || '',
                    timezone: data.user.timezone || 'Central Africa Time',
                    language: data.user.language || 'English',
                    currency: data.user.currency || 'ZMW - Zambian Kwacha (ZK)',
                    currencySymbol: data.user.currencySymbol || 'K',
                    currencyCode: data.user.currencyCode || 'ZMW',
                    profilePicture: data.user.avatar
                };

                updateProfile(updatedProfile);

                updateBudgetPreferences({ currency: 'ZMW', currencySymbol: 'K' });

                setIsEditing(false);
                setOriginalProfile(null);

                if (!toastShown) {
                    toast.success('Profile updated successfully!', { id: 'profile-update-success' });
                    setToastShown(true);
                }
            } else {
                toast.error(data.error || 'Failed to update profile', { id: 'profile-update-error' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile. Please try again.', { id: 'profile-update-error' });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = () => {
        setOriginalProfile({ ...profile });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (originalProfile) updateProfile(originalProfile);
        setIsEditing(false);
        setOriginalProfile(null);
    };

    const handleResetToDefaults = async () => {
        if (!user?.id) return;
        if (!confirm('Are you sure you want to reset your profile to default values?')) return;

        const defaultProfile = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+260 ',
            timezone: 'Central Africa Time',
            language: 'English',
            currency: 'ZMW - Zambian Kwacha (ZK)',
            currencySymbol: 'K',
            currencyCode: 'ZMW',
            profilePicture: undefined
        };

        updateProfile(defaultProfile);
        updateBudgetPreferences({ currency: 'ZMW', currencySymbol: 'K', warningThreshold: 80 });

        const profileData = {
            userId: user.id,
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: null,
            phone: '+260 ',
            timezone: 'Central Africa Time',
            language: 'English',
            currency: 'ZMW - Zambian Kwacha (ZK)',
            currencySymbol: 'K',
            currencyCode: 'ZMW'
        };

        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });
            toast.success('Profile reset to defaults', { id: 'profile-reset' });
        } catch (error) {
            console.error('Error resetting profile:', error);
            toast.error('Failed to reset profile', { id: 'profile-reset-error' });
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                    <p className="text-gray-600 mt-1">Update your personal information and preferences</p>
                </div>
                <button onClick={isEditing ? handleCancel : handleEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {/* Profile Picture and Personal Info omitted for brevity... */}
            {/* Implement similar to your current code with InfoItem and SelectItem */}
        </div>
    );
}

function InfoItem({ label, value, isEditing, name, onChange, type = 'text' }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
            {isEditing ? (
                <input type={type} name={name} value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            ) : (
                <p className="text-gray-900 font-medium">{value}</p>
            )}
        </div>
    );
}

function SelectItem({ label, value, isEditing, name, onChange, options }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
            {isEditing ? (
                <select name={name} value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {options.map((option: string) => <option key={option} value={option}>{option}</option>)}
                </select>
            ) : (
                <p className="text-gray-900 font-medium">{value}</p>
            )}
        </div>
    );
}
