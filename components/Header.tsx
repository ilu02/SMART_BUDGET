'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AddTransactionModal from './AddTransactionModal';
import NotificationPreview from './NotificationPreview';
import CurrentDate from './CurrentDate';
import { Button } from './ui/Button';
import { useTransactions } from '../app/contexts/TransactionContext';
import { useNotifications } from '../app/contexts/NotificationContext';
import { useAuth } from '../app/contexts/AuthContext';
import { useSettings } from '../app/contexts/SettingsContext';
import { useTutorial } from '../hooks/useTutorial';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationPreviewOpen, setIsNotificationPreviewOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { addTransaction } = useTransactions();
  const { unreadCount } = useNotifications();
  const { logout, user } = useAuth();
  const { profile } = useSettings();
  const { startTutorial } = useTutorial();
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate unique avatar URL for users without profile pictures
  const getUniqueAvatar = (userId: string, userEmail: string) => {
    // Use DiceBear avatars with user ID as seed for uniqueness
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9&scale=80`;
  };

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle notification preview hover
  const handleNotificationMouseEnter = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setIsNotificationPreviewOpen(true);
  };

  const handleNotificationMouseLeave = () => {
    notificationTimeoutRef.current = setTimeout(() => {
      setIsNotificationPreviewOpen(false);
    }, 300); // Small delay to allow moving to the dropdown
  };

  const handlePreviewMouseEnter = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
  };

  const handlePreviewMouseLeave = () => {
    setIsNotificationPreviewOpen(false);
  };

  // Close notification preview when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationPreviewOpen(false);
      }
    };

    if (isNotificationPreviewOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationPreviewOpen]);

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const handleSaveTransaction = (transactionData: any) => {
    addTransaction(transactionData);
  };

  return (
    <>
      <header 
        className={`
          ${isSticky ? 'fixed top-0 left-0 right-0 z-40 shadow-lg backdrop-blur-sm' : 'relative'} 
          bg-gradient-to-r from-blue-50/80 via-white to-purple-50/80 
          border-b border-gray-200/60 
          px-4 sm:px-6 lg:px-8 
          py-3 sm:py-4 
          transition-all duration-300 ease-in-out
          ${isSticky ? 'bg-white/95' : ''}
          pt-safe-top
        `}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto min-h-[44px]">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                <i className="ri-wallet-3-line text-white text-lg" aria-hidden="true"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900 transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text">
                Smart Budget
              </h1>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              <Link 
                href="/dashboard" 
                className={`font-medium transition-colors text-sm lg:text-base ${
                  isActive('/dashboard') 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/transactions" 
                className={`font-medium transition-colors text-sm lg:text-base ${
                  isActive('/transactions') 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-gray-600 hover:text-primary'
                }`}
                data-tutorial="nav-transactions"
              >
                Transactions
              </Link>
              <Link 
                href="/budgets" 
                className={`font-medium transition-colors text-sm lg:text-base ${
                  isActive('/budgets') 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-gray-600 hover:text-primary'
                }`}
                data-tutorial="nav-budgets"
              >
                Budgets
              </Link>
              <Link 
                href="/categories" 
                className={`font-medium transition-colors text-sm lg:text-base ${
                  isActive('/categories') 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-gray-600 hover:text-primary'
                }`}
                data-tutorial="nav-categories"
              >
                Categories
              </Link>
              <Link 
                href="/analytics" 
                className={`font-medium transition-colors text-sm lg:text-base ${
                  isActive('/analytics') 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Analytics
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Current Date - Hidden on mobile */}
            <CurrentDate />
            
            {/* Add Transaction Button - Responsive */}
            <Button 
              onClick={() => setIsModalOpen(true)} 
              className="btn-responsive btn-gradient hidden sm:flex items-center" 
              data-tutorial="add-transaction-btn"
            >
              <i className="ri-add-line mr-2" aria-hidden="true"></i>
              <span className="hidden md:inline">Add Transaction</span>
              <span className="md:hidden">Add</span>
            </Button>
            
            {/* Mobile Add Button */}
            <Button 
              onClick={() => setIsModalOpen(true)} 
              className="sm:hidden touch-target p-2 bg-primary text-white rounded-lg" 
              aria-label="Add Transaction"
            >
              <i className="ri-add-line text-lg" aria-hidden="true"></i>
            </Button>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div 
                ref={notificationRef}
                className="relative"
                onMouseEnter={handleNotificationMouseEnter}
                onMouseLeave={handleNotificationMouseLeave}
              >
                <Link 
                  href="/notifications" 
                  aria-label="Notifications" 
                  className={`relative p-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:bg-gray-100 ${
                    isActive('/notifications') 
                      ? 'text-primary bg-primary-light' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <i className="ri-notification-3-line text-xl" aria-hidden="true"></i>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                
                {/* Notification Preview Dropdown */}
                <div
                  onMouseEnter={handlePreviewMouseEnter}
                  onMouseLeave={handlePreviewMouseLeave}
                >
                  <NotificationPreview 
                    isVisible={isNotificationPreviewOpen}
                    onClose={() => setIsNotificationPreviewOpen(false)}
                  />
                </div>
              </div>
              <Link 
                href="/settings" 
                className={`touch-target p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive('/settings') 
                    ? 'text-primary bg-primary-light' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                data-tutorial="nav-settings"
                aria-label="Settings"
              >
                <i className="ri-settings-3-line text-xl" aria-hidden="true"></i>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="touch-target w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center transition-colors hover:bg-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  {profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="ri-user-3-line text-gray-600" aria-hidden="true"></i>
                  )}
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {profile.profilePicture ? (
                            <img 
                              src={profile.profilePicture} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="ri-user-3-line text-gray-600" aria-hidden="true"></i>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {profile.firstName} {profile.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="ri-user-settings-line mr-2" aria-hidden="true"></i>
                      Edit Profile
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="ri-settings-3-line mr-2" aria-hidden="true"></i>
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        startTutorial();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <i className="ri-question-line mr-2" aria-hidden="true"></i>
                      Help & Tutorial
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <i className="ri-logout-box-line mr-2" aria-hidden="true"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden touch-target p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ml-2"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                <i className={`text-xl transition-transform duration-200 ${isMobileMenuOpen ? 'ri-close-line rotate-90' : 'ri-menu-line'}`} aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <nav className="space-y-2">
                <Link 
                  href="/dashboard" 
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-primary bg-primary-light border-l-4 border-primary' 
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="ri-dashboard-3-line mr-3" aria-hidden="true"></i>
                  Dashboard
                </Link>
                <Link 
                  href="/transactions" 
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive('/transactions') 
                      ? 'text-primary bg-primary-light border-l-4 border-primary' 
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="ri-exchange-line mr-3" aria-hidden="true"></i>
                  Transactions
                </Link>
                <Link 
                  href="/budgets" 
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive('/budgets') 
                      ? 'text-primary bg-primary-light border-l-4 border-primary' 
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="ri-wallet-3-line mr-3" aria-hidden="true"></i>
                  Budgets
                </Link>
                <Link 
                  href="/categories" 
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive('/categories') 
                      ? 'text-primary bg-primary-light border-l-4 border-primary' 
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="ri-price-tag-3-line mr-3" aria-hidden="true"></i>
                  Categories
                </Link>
                <Link 
                  href="/analytics" 
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive('/analytics') 
                      ? 'text-primary bg-primary-light border-l-4 border-primary' 
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="ri-pie-chart-line mr-3" aria-hidden="true"></i>
                  Analytics
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from being hidden behind sticky header */}
      {isSticky && <div className="h-20"></div>}

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
      />
    </>
  );
}