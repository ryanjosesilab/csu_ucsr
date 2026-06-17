'use client'; 

import { useEffect } from 'react';
import AOS from 'aos';

export default function AOSInit() {
  useEffect(() => {
    // 1. Initialize AOS
    AOS.init({
      once: false,
      duration: 800,
      easing: 'ease-out',
    });

    // 2. Refresh AOS to recalculate element positions 
    // This is the key fix for animations that don't trigger
    const refreshAOS = () => {
      AOS.refresh();
    };

    // Delay refresh slightly to ensure images/sections are fully rendered
    const timer = setTimeout(refreshAOS, 500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}