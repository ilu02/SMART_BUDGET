'use client';

import { useSettings } from './contexts/SettingsContext';
import { useEffect } from 'react';

const colorSchemeMap = {
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  orange: '#F97316',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
  red: '#EF4444',
  amber: '#F59E0B',
  emerald: '#059669'
};

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { appearance } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (appearance.theme === 'dark') {
      root.classList.add('dark');
    } else if (appearance.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme - check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply color scheme (custom color takes priority)
    const primaryColor = appearance.customPrimaryColor || colorSchemeMap[appearance.colorScheme];
    root.style.setProperty('--primary-color', primaryColor);
    
    // Update CSS custom properties for the color scheme
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-primary-rgb', hexToRgb(primaryColor));

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[appearance.fontSize]);
    root.style.fontSize = fontSizeMap[appearance.fontSize];

    // Apply layout settings
    root.setAttribute('data-layout', appearance.layout || 'default');
    root.setAttribute('data-card-style', appearance.cardStyle || 'default');
    root.setAttribute('data-sidebar-position', appearance.sidebarPosition || 'left');
    root.setAttribute('data-font-size', appearance.fontSize || 'medium');

    // Apply compact mode
    if (appearance.compactMode) {
      root.classList.add('compact-mode');
      root.style.setProperty('--spacing-unit', '0.75rem');
      root.style.setProperty('--component-padding', '0.5rem');
    } else {
      root.classList.remove('compact-mode');
      root.style.setProperty('--spacing-unit', '1rem');
      root.style.setProperty('--component-padding', '1rem');
    }

    // Apply animations
    if (!appearance.animations) {
      root.classList.add('no-animations');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.classList.remove('no-animations');
      root.style.setProperty('--transition-duration', '0.2s');
    }

    // Update button colors dynamically
    const style = document.createElement('style');
    style.textContent = `
      .btn-primary {
        background-color: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
      }
      .btn-primary:hover {
        background-color: ${adjustBrightness(primaryColor, -20)} !important;
        border-color: ${adjustBrightness(primaryColor, -20)} !important;
      }
      .text-primary {
        color: ${primaryColor} !important;
      }
      .border-primary {
        border-color: ${primaryColor} !important;
      }
      .bg-primary {
        background-color: ${primaryColor} !important;
      }
      .bg-primary-light {
        background-color: ${hexToRgba(primaryColor, 0.1)} !important;
      }
      .bg-primary-lighter {
        background-color: ${hexToRgba(primaryColor, 0.05)} !important;
      }
      .ring-primary {
        --tw-ring-color: ${primaryColor} !important;
      }
    `;
    
    // Remove existing dynamic styles
    const existingStyle = document.getElementById('dynamic-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    style.id = 'dynamic-theme-styles';
    document.head.appendChild(style);

  }, [appearance]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (appearance.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement;
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [appearance.theme]);

  return <>{children}</>;
}

// Helper functions
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '59, 130, 246'; // fallback to blue
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(59, 130, 246, ${alpha})`; // fallback to blue
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}