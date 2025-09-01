'use client';

import { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveLayout({ children, className = '' }: ResponsiveLayoutProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      setOrientation(width > height ? 'landscape' : 'portrait');
      
      // Define breakpoints
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    // Initial check
    updateDimensions();

    // Listen for resize and orientation changes
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(updateDimensions, 100);
    });

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  // Dynamic classes based on screen size and orientation
  const responsiveClasses = [
    // Base responsive classes
    'min-h-screen w-full',
    
    // Screen size specific classes
    screenSize === 'mobile' && 'mobile-layout',
    screenSize === 'tablet' && 'tablet-layout',
    screenSize === 'desktop' && 'desktop-layout',
    
    // Orientation specific classes
    orientation === 'landscape' && 'landscape-layout',
    orientation === 'portrait' && 'portrait-layout',
    
    // Safe area handling for mobile devices
    screenSize === 'mobile' && 'pb-safe-bottom pl-safe-left pr-safe-right',
    
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={responsiveClasses}
      style={{
        '--screen-width': `${dimensions.width}px`,
        '--screen-height': `${dimensions.height}px`,
        '--safe-area-inset-top': 'env(safe-area-inset-top)',
        '--safe-area-inset-right': 'env(safe-area-inset-right)',
        '--safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
        '--safe-area-inset-left': 'env(safe-area-inset-left)',
      } as React.CSSProperties}
    >
      {children}
      

    </div>
  );
}