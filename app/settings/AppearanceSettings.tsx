'use client';

import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';
import toast from 'react-hot-toast';

const colorSchemes = [
  { id: 'blue', name: 'Blue', color: 'bg-blue-500', primary: '#3B82F6', gradient: 'from-blue-500 to-blue-600' },
  { id: 'green', name: 'Green', color: 'bg-green-500', primary: '#10B981', gradient: 'from-green-500 to-green-600' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-500', primary: '#8B5CF6', gradient: 'from-purple-500 to-purple-600' },
  { id: 'orange', name: 'Orange', color: 'bg-orange-500', primary: '#F97316', gradient: 'from-orange-500 to-orange-600' },
  { id: 'pink', name: 'Pink', color: 'bg-pink-500', primary: '#EC4899', gradient: 'from-pink-500 to-pink-600' },
  { id: 'indigo', name: 'Indigo', color: 'bg-indigo-500', primary: '#6366F1', gradient: 'from-indigo-500 to-indigo-600' },
  { id: 'teal', name: 'Teal', color: 'bg-teal-500', primary: '#14B8A6', gradient: 'from-teal-500 to-teal-600' },
  { id: 'red', name: 'Red', color: 'bg-red-500', primary: '#EF4444', gradient: 'from-red-500 to-red-600' },
  { id: 'amber', name: 'Amber', color: 'bg-amber-500', primary: '#F59E0B', gradient: 'from-amber-500 to-amber-600' },
  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500', primary: '#059669', gradient: 'from-emerald-500 to-emerald-600' }
];

const fontSizes = [
  { id: 'small', name: 'Small', description: 'Compact text size', size: '14px' },
  { id: 'medium', name: 'Medium', description: 'Default text size', size: '16px' },
  { id: 'large', name: 'Large', description: 'Larger text for better readability', size: '18px' },
  { id: 'extra-large', name: 'Extra Large', description: 'Maximum readability', size: '20px' }
];

const layoutOptions = [
  { id: 'default', name: 'Default', description: 'Standard layout with sidebar' },
  { id: 'wide', name: 'Wide', description: 'Full-width layout without sidebar' },
  { id: 'centered', name: 'Centered', description: 'Centered content with max width' }
];

const cardStyles = [
  { id: 'default', name: 'Default', description: 'Standard rounded corners', class: 'rounded-lg' },
  { id: 'sharp', name: 'Sharp', description: 'Square corners', class: 'rounded-none' },
  { id: 'rounded', name: 'Rounded', description: 'Extra rounded corners', class: 'rounded-xl' },
  { id: 'pill', name: 'Pill', description: 'Fully rounded edges', class: 'rounded-full' }
];

export default function AppearanceSettings() {
  const { appearance, updateAppearance } = useSettings();
  const { user } = useAuth();
  const [customColor, setCustomColor] = useState('#3B82F6');
  const [previewMode, setPreviewMode] = useState<'card' | 'button' | 'form'>('card');

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updateAppearance({ theme });
    toast.success(`Theme changed to ${theme === 'auto' ? 'system preference' : theme} mode`);
  };

  const handleColorSchemeChange = (colorScheme: string) => {
    updateAppearance({ colorScheme: colorScheme as any });
    toast.success(`Color scheme changed to ${colorScheme}`);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    updateAppearance({ customPrimaryColor: color });
    toast.success('Custom color applied');
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large' | 'extra-large') => {
    updateAppearance({ fontSize: fontSize as any });
    toast.success(`Font size changed to ${fontSize.replace('-', ' ')}`);
  };

  const handleLayoutChange = (layout: string) => {
    updateAppearance({ layout: layout as any });
    toast.success(`Layout changed to ${layout}`);
  };

  const handleCardStyleChange = (cardStyle: string) => {
    updateAppearance({ cardStyle: cardStyle as any });
    toast.success(`Card style changed to ${cardStyle}`);
  };

  const handleToggleCompactMode = () => {
    updateAppearance({ compactMode: !appearance.compactMode });
    toast.success(`Compact mode ${!appearance.compactMode ? 'enabled' : 'disabled'}`);
  };

  const handleToggleAnimations = () => {
    updateAppearance({ animations: !appearance.animations });
    toast.success(`Animations ${!appearance.animations ? 'enabled' : 'disabled'}`);
  };

  const handleToggleSidebarPosition = () => {
    updateAppearance({ sidebarPosition: appearance.sidebarPosition === 'left' ? 'right' : 'left' });
    toast.success(`Sidebar moved to ${appearance.sidebarPosition === 'left' ? 'right' : 'left'}`);
  };

  const getCurrentColorScheme = () => {
    return colorSchemes.find(s => s.id === appearance.colorScheme) || colorSchemes[0];
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appearance</h2>
        <p className="text-gray-600">Customize how the app looks and feels</p>
      </div>

      {/* User-specific settings info */}
      {user && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <i className="ri-information-line text-blue-600 text-lg" aria-hidden="true"></i>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Personal Appearance Settings</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your appearance preferences are now saved to your account and will sync across all your devices. 
                These settings are unique to you and will be remembered when you log in from anywhere.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Theme Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
          <div className="text-sm text-gray-500">
            Current: <span className="font-medium capitalize">{appearance.theme}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              id: 'light', 
              name: 'Light', 
              description: 'Clean and bright interface',
              icon: 'ri-sun-line',
              preview: 'bg-white border-2 border-gray-200'
            },
            { 
              id: 'dark', 
              name: 'Dark', 
              description: 'Easy on the eyes in low light',
              icon: 'ri-moon-line',
              preview: 'bg-gray-800 border-2 border-gray-600'
            },
            { 
              id: 'auto', 
              name: 'Auto', 
              description: 'Follows your system preference',
              icon: 'ri-computer-line',
              preview: 'bg-gradient-to-r from-white via-gray-200 to-gray-800 border-2 border-gray-400'
            }
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id as any)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                appearance.theme === theme.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme.preview}`}>
                  <i className={`${theme.icon} text-lg ${theme.id === 'dark' ? 'text-white' : 'text-gray-700'}`}></i>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{theme.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{theme.description}</div>
                  {appearance.theme === theme.id && (
                    <div className="flex items-center mt-2 text-xs text-blue-600">
                      <i className="ri-check-line mr-1"></i>
                      Active
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* System Theme Detection Info */}
        {appearance.theme === 'auto' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-sm text-blue-700">
              <i className="ri-information-line mr-2"></i>
              <span>
                Currently using <strong>{typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}</strong> mode based on your system settings
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Enhanced Color Scheme */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Color Scheme</h3>
          <div className="text-sm text-gray-500">
            Current: <span className="font-medium capitalize">{appearance.colorScheme}</span>
          </div>
        </div>
        
        {/* Predefined Colors */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Predefined Colors</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => handleColorSchemeChange(scheme.id)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  appearance.colorScheme === scheme.id
                    ? 'border-gray-800 bg-gray-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${scheme.gradient} shadow-sm`}></div>
                  <span className="text-xs font-medium text-gray-700">{scheme.name}</span>
                  {appearance.colorScheme === scheme.id && (
                    <div className="flex items-center text-xs text-gray-600">
                      <i className="ri-check-line mr-1"></i>
                      Active
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Picker */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Color</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                title="Choose custom color"
              />
              <div className="text-sm">
                <div className="font-medium text-gray-700">Custom Color</div>
                <div className="text-gray-500 font-mono text-xs">{customColor}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCustomColorChange(customColor)}
              className="ml-auto"
            >
              Apply Custom
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Choose any color to personalize your interface. Custom colors override predefined schemes.
          </p>
        </div>
      </Card>

      {/* Enhanced Font Size */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Typography</h3>
          <div className="text-sm text-gray-500">
            Current: <span className="font-medium capitalize">{appearance.fontSize?.replace('-', ' ')}</span>
          </div>
        </div>
        <div className="space-y-3">
          {fontSizes.map((size) => (
            <label key={size.id} className="flex items-center space-x-4 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="fontSize"
                value={size.id}
                checked={appearance.fontSize === size.id}
                onChange={() => handleFontSizeChange(size.id as any)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900" style={{ fontSize: size.size }}>
                  {size.name} - Sample Text
                </div>
                <div className="text-sm text-gray-500">{size.description}</div>
              </div>
              <div className="text-xs text-gray-400 font-mono">{size.size}</div>
            </label>
          ))}
        </div>
      </Card>

      {/* Layout Customization */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Layout & Structure</h3>
        </div>
        
        {/* Layout Options */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Layout Style</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {layoutOptions.map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleLayoutChange(layout.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                  appearance.layout === layout.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900 mb-1">{layout.name}</div>
                <div className="text-sm text-gray-500">{layout.description}</div>
                {appearance.layout === layout.id && (
                  <div className="flex items-center mt-2 text-xs text-blue-600">
                    <i className="ri-check-line mr-1"></i>
                    Active
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Card Style Options */}
        <div className="mb-6 border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Card Style</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cardStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleCardStyleChange(style.id)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  appearance.cardStyle === style.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-8 bg-gray-200 border border-gray-300 ${style.class}`}></div>
                  <div className="text-xs font-medium text-gray-700">{style.name}</div>
                  {appearance.cardStyle === style.id && (
                    <div className="flex items-center text-xs text-blue-600">
                      <i className="ri-check-line mr-1"></i>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Position */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Sidebar Position</h4>
              <p className="text-sm text-gray-500">Choose which side to display the navigation sidebar</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Left</span>
              <button
                onClick={handleToggleSidebarPosition}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  appearance.sidebarPosition === 'right' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    appearance.sidebarPosition === 'right' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">Right</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Display Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Compact Mode</h4>
              <p className="text-sm text-gray-500">Reduce spacing and padding for a denser layout</p>
            </div>
            <button
              onClick={handleToggleCompactMode}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                appearance.compactMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  appearance.compactMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Animations</h4>
              <p className="text-sm text-gray-500">Enable smooth transitions and animations</p>
            </div>
            <button
              onClick={handleToggleAnimations}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                appearance.animations ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  appearance.animations ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Enhanced Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
          <div className="flex items-center space-x-2">
            {['card', 'button', 'form'].map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode as any)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  previewMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className={`border-2 border-dashed border-gray-200 rounded-xl p-6 ${
          appearance.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          {previewMode === 'card' && (
            <div className="space-y-4">
              {/* Header Preview */}
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-sm`}
                  style={{ backgroundColor: getCurrentColorScheme().primary }}
                >
                  <i className="ri-wallet-3-line text-lg" aria-hidden="true"></i>
                </div>
                <div>
                  <h4 
                    className={`font-semibold ${appearance.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontSize: fontSizes.find(f => f.id === appearance.fontSize)?.size }}
                  >
                    Smart Budget
                  </h4>
                  <p 
                    className={`${appearance.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                    style={{ fontSize: `calc(${fontSizes.find(f => f.id === appearance.fontSize)?.size} * 0.875)` }}
                  >
                    Your financial dashboard
                  </p>
                </div>
              </div>
              
              {/* Card Preview */}
              <div className={`${appearance.compactMode ? 'space-y-2' : 'space-y-3'}`}>
                <div 
                  className={`${appearance.theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border shadow-sm ${
                    cardStyles.find(s => s.id === appearance.cardStyle)?.class || 'rounded-lg'
                  } ${appearance.compactMode ? 'p-3' : 'p-4'}`}
                >
                  <div className="flex justify-between items-center">
                    <span 
                      className={`${appearance.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                      style={{ fontSize: fontSizes.find(f => f.id === appearance.fontSize)?.size }}
                    >
                      Sample Transaction
                    </span>
                    <span 
                      className="font-semibold"
                      style={{ 
                        color: getCurrentColorScheme().primary,
                        fontSize: fontSizes.find(f => f.id === appearance.fontSize)?.size 
                      }}
                    >
                      K25.00
                    </span>
                  </div>
                  <div className={`${appearance.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    <span style={{ fontSize: `calc(${fontSizes.find(f => f.id === appearance.fontSize)?.size} * 0.75)` }}>
                      Food & Dining • Today
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewMode === 'button' && (
            <div className="space-y-4">
              <h4 className={`font-medium mb-4 ${appearance.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Button Styles Preview
              </h4>
              <div className="flex flex-wrap gap-3">
                <button 
                  className={`px-4 py-2 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all ${
                    cardStyles.find(s => s.id === appearance.cardStyle)?.class || 'rounded-lg'
                  }`}
                  style={{ 
                    backgroundColor: getCurrentColorScheme().primary,
                    fontSize: fontSizes.find(f => f.id === appearance.fontSize)?.size 
                  }}
                >
                  Primary Button
                </button>
                <button 
                  className={`px-4 py-2 border-2 font-medium transition-all hover:shadow-sm ${
                    appearance.theme === 'dark' 
                      ? 'border-gray-600 text-gray-200 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${cardStyles.find(s => s.id === appearance.cardStyle)?.class || 'rounded-lg'}`}
                  style={{ 
                    borderColor: getCurrentColorScheme().primary + '40',
                    color: getCurrentColorScheme().primary,
                    fontSize: fontSizes.find(f => f.id === appearance.fontSize)?.size 
                  }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          )}

          {previewMode === 'form' && (
            <div className="space-y-4">
              <h4 className={`font-medium mb-4 ${appearance.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Form Elements Preview
              </h4>
              <div className="space-y-3">
                <div>
                  <label 
                    className={`block text-sm font-medium mb-1 ${appearance.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                    style={{ fontSize: `calc(${fontSizes.find(f => f.id === appearance.fontSize)?.size} * 0.875)` }}
                  >
                    Sample Input
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter text here..."
                    className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      appearance.theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${cardStyles.find(s => s.id === appearance.cardStyle)?.class || 'rounded-lg'}`}
                    style={{ 
                      fontSize: fontSizes.find(f => f.id === appearance.fontSize)?.size,
                      '--tw-ring-color': getCurrentColorScheme().primary 
                    } as any}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                    style={{ '--tw-ring-color': getCurrentColorScheme().primary } as any}
                  />
                  <label 
                    className={`${appearance.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                    style={{ fontSize: fontSizes.find(f => f.id === appearance.fontSize)?.size }}
                  >
                    Sample checkbox
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* Theme indicator */}
          <div className="mt-6 pt-4 border-t border-gray-300 border-dashed">
            <div className="flex items-center justify-between text-xs">
              <span className={`${appearance.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Theme: <strong className="capitalize">{appearance.theme}</strong>
              </span>
              <span className={`${appearance.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Color: <strong className="capitalize">{appearance.colorScheme}</strong>
              </span>
              <span className={`${appearance.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Size: <strong className="capitalize">{appearance.fontSize?.replace('-', ' ')}</strong>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Reset and Export Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Management</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => {
              updateAppearance({
                theme: 'light',
                compactMode: false,
                animations: true,
                fontSize: 'medium',
                colorScheme: 'blue',
                layout: 'default',
                cardStyle: 'default',
                sidebarPosition: 'left'
              });
              setCustomColor('#3B82F6');
              toast.success('All appearance settings reset to defaults');
            }}
            className="flex items-center space-x-2"
          >
            <i className="ri-refresh-line"></i>
            <span>Reset to Defaults</span>
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <i className="ri-information-line mr-1"></i>
            Your appearance preferences are automatically saved and will be restored when you log in from any device.
          </p>
        </div>
      </Card>
    </div>
  );
}