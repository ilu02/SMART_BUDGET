'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../app/contexts/AuthContext';

export function useTutorial() {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user has seen the tutorial
      const tutorialKey = `tutorial_seen_${user.id}`;
      const seen = localStorage.getItem(tutorialKey);
      
      if (!seen) {
        // Show welcome modal for new users after a short delay
        const timer = setTimeout(() => {
          setShowWelcome(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      } else {
        setHasSeenTutorial(true);
      }
    }
  }, [user]);

  const startTutorial = () => {
    setShowWelcome(false);
    setShowTutorial(true);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const closeWelcome = () => {
    setShowWelcome(false);
    if (user) {
      const tutorialKey = `tutorial_seen_${user.id}`;
      localStorage.setItem(tutorialKey, 'true');
      setHasSeenTutorial(true);
    }
  };

  const completeTutorial = () => {
    if (user) {
      const tutorialKey = `tutorial_seen_${user.id}`;
      localStorage.setItem(tutorialKey, 'true');
      setHasSeenTutorial(true);
    }
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    if (user) {
      const tutorialKey = `tutorial_seen_${user.id}`;
      localStorage.removeItem(tutorialKey);
      setHasSeenTutorial(false);
    }
  };

  return {
    showTutorial,
    showWelcome,
    hasSeenTutorial,
    startTutorial,
    closeTutorial,
    closeWelcome,
    completeTutorial,
    resetTutorial
  };
}