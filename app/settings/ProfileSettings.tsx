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

export default function ProfileSettings() {
    const [isEditing, setIsEditing] = useState(false);
    const [originalProfile, setOriginalProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const { profile, updateProfile, updateBudgetPreferences, loading } = useSettings();
    const { user, updateProfile: updateUserProfile } = useAuth();
    const [toastShown, setToastShown] = useState(false);

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
        );
    }

    // Show message if user is not authenticated
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

    const handleSave = async () => {
        // Prevent multiple saves
        if (saving) return;
        
        // Basic validation
        if (!profile.firstName.trim() || !profile.lastName.trim()) {
            toast.error('First name and last name are required');
            return;
        }
        
        if (!profile.email.trim()) {
            toast.error('Email address is required');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setSaving(true);
        setToastShown(false); // Reset toast state

        try {
            // Prepare ALL profile data to send to backend
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

            console.log('Saving profile data:', profileData);

            // Update user profile in database
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (response.ok) {
                // Update the user in AuthContext with complete data from backend
                if (updateUserProfile) {
                    updateUserProfile(data.user);
                }
                
                // Update local state with all values from the response
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
                
                // Update budget preferences with fixed currency
                updateBudgetPreferences({
                    currency: 'ZMW',
                    currencySymbol: 'K',
                });

                setIsEditing(false);
                setOriginalProfile(null);
                
                // Show success toast only once with a unique ID
                if (!toastShown) {
                    toast.success('Profile updated successfully!', { id: 'profile-update-success' });
                    setToastShown(true);
                }
                
            } else {
                console.error('API Error:', data);
                toast.error(data.error || 'Failed to update profile', { id: 'profile-update-error' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile. Please try again.', { id: 'profile-update-error' });
        } finally {
            setSaving(false);
        }
    };

    // Helper function to parse name into first and last name
    const parseUserName = (name: string) => {
        if (!name) return { firstName: 'John', lastName: 'Doe' };
        
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return { firstName: parts[0], lastName: '' };
        }
        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' ')
        };
    };

    const handleEdit = () => {
        setOriginalProfile({ ...profile });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (originalProfile) {
            updateProfile(originalProfile);
        }
        setIsEditing(false);
        setOriginalProfile(null);
    };

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) {
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.', { id: 'profile-picture-error' });
            return;
        }

        // Check file size (1MB limit)
        if (file.size > 1024 * 1024) {
            toast.error('File size too large. Maximum size is 1MB.', { id: 'profile-picture-error' });
            return;
        }

        try {
            // Show loading state
            const loadingToast = toast.loading('Uploading profile picture...', { id: 'profile-picture-upload' });

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user.id);
            formData.append('type', 'avatar');

            // Upload file
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Update profile with the new image URL
                updateProfile({ profilePicture: data.url });
                
                // Also update the avatar in the user profile
                const profileData = {
                    userId: user.id,
                    name: `${profile.firstName} ${profile.lastName}`.trim(),
                    email: profile.email,
                    avatar: data.url,
                    phone: profile.phone || '',
                    timezone: profile.timezone || 'Central Africa Time',
                    language: 'English',
                    currency: 'ZMW - Zambian Kwacha (ZK)',
                    currencySymbol: 'K',
                    currencyCode: 'ZMW'
                };

                // Update user profile in database with new avatar
                await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileData),
                });

                toast.success('Profile picture updated!', { id: loadingToast });
            } else {
                toast.error(data.error || 'Failed to upload profile picture', { id: loadingToast });
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            toast.error('Failed to upload profile picture. Please try again.', { id: 'profile-picture-error' });
        }
    };

    const handleRemoveProfilePicture = async () => {
        if (!user?.id) return;

        updateProfile({ profilePicture: undefined });
        
        // Also update the database
        const profileData = {
            userId: user.id,
            name: `${profile.firstName} ${profile.lastName}`.trim(),
            email: profile.email,
            avatar: null,
            phone: profile.phone || '',
            timezone: profile.timezone || 'Central Africa Time',
            language: 'English',
            currency: 'ZMW - Zambian Kwacha (ZK)',
            currencySymbol: 'K',
            currencyCode: 'ZMW'
        };
        
        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });
            toast.success('Profile picture removed', { id: 'profile-picture-remove' });
        } catch (error) {
            console.error('Error removing profile picture:', error);
            toast.error('Failed to remove profile picture', { id: 'profile-picture-error' });
        }
    };

    const handleResetToDefaults = async () => {
        if (!user?.id) return;

        if (confirm('Are you sure you want to reset your profile to default values?')) {
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
            
            // Also update the database
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
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileData),
                });
                
                updateBudgetPreferences({
                    currency: 'ZMW',
                    currencySymbol: 'K',
                    warningThreshold: 80,
                });
                
                toast.success('Profile reset to defaults', { id: 'profile-reset' });
            } catch (error) {
                console.error('Error resetting profile:', error);
                toast.error('Failed to reset profile', { id: 'profile-reset-error' });
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                    <p className="text-gray-600 mt-1">Update your personal information and preferences</p>
                </div>
                <button
                    onClick={isEditing ? handleCancel : handleEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {/* Profile Picture */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Profile Picture</h3>
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                        {profile.profilePicture ? (
                            <img 
                                src={profile.profilePicture} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <i className="ri-user-3-line text-4xl text-blue-600"></i>
                        )}
                    </div>
                    <div>
                        <input
                            type="file"
                            id="profilePicture"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="profilePicture"
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 cursor-pointer inline-block"
                        >
                            Change Photo
                        </label>
                        {profile.profilePicture && (
                            <button
                                onClick={handleRemoveProfilePicture}
                                className="ml-2 text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                                Remove
                            </button>
                        )}
                        <p className="text-sm text-gray-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="First Name" value={profile.firstName} isEditing={isEditing} name="firstName" onChange={handleInputChange} />
                    <InfoItem label="Last Name" value={profile.lastName} isEditing={isEditing} name="lastName" onChange={handleInputChange} />
                    <InfoItem label="Email Address" value={profile.email} isEditing={isEditing} name="email" onChange={handleInputChange} type="email" />
                    <InfoItem label="Phone Number" value={profile.phone} isEditing={isEditing} name="phone" onChange={handleInputChange} type="tel" />
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectItem label="Timezone" value={profile.timezone} isEditing={isEditing} name="timezone" onChange={handleInputChange} options={timezones} />
                    
                    {/* Fixed Language Display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Language</label>
                        <p className="text-gray-900 font-medium">English</p>
                    </div>
                    
                    {/* Fixed Currency Display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Currency</label>
                        <p className="text-gray-900 font-medium">ZMW - Zambian Kwacha (ZK)</p>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleResetToDefaults}
                        className="text-red-600 hover:text-red-700 font-medium"
                    >
                        Reset to Defaults
                    </button>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleCancel}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center"
                        >
                            {saving && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoItem({ label, value, isEditing, name, onChange, type = 'text' }: { label: string, value: string, isEditing: boolean, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
            {isEditing ? (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    aria-label={label}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            ) : (
                <p className="text-gray-900 font-medium">{value}</p>
            )}
        </div>
    );
}

function SelectItem({ label, value, isEditing, name, onChange, options }: { label: string, value: string, isEditing: boolean, name: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
            {isEditing ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    aria-label={label}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            ) : (
                <p className="text-gray-900 font-medium">{value}</p>
            )}
        </div>
    );
}