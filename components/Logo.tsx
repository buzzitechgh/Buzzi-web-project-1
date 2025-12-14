import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  lightMode?: boolean; // If true, text is white (for dark headers)
  customSrc?: string | null; // For explicitly passed logo
}

const Logo: React.FC<LogoProps> = ({ className = "h-10", lightMode = false, customSrc }) => {
  const [logoSrc, setLogoSrc] = useState<string | null>(customSrc || null);

  useEffect(() => {
    if (customSrc) {
      setLogoSrc(customSrc);
      return;
    }

    const loadLogo = () => {
      try {
        const savedSettings = localStorage.getItem('buzzitech_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.logoUrl) {
            setLogoSrc(parsed.logoUrl);
          }
        }
      } catch (e) {
        console.warn("Failed to load logo settings", e);
      }
    };

    loadLogo();
    
    // Listen for global settings updates to refresh logo instantly
    window.addEventListener('settingsUpdated', loadLogo);
    return () => window.removeEventListener('settingsUpdated', loadLogo);
  }, [customSrc]);

  // If a custom logo exists, render it as an image
  if (logoSrc) {
    return (
      <img 
        src={logoSrc} 
        alt="Buzzitech Logo" 
        className={`object-contain w-auto ${className}`}
        style={{ maxWidth: '100%' }} // Prevents overflow while respecting the height set by className
      />
    );
  }

  // Fallback: Default Geometric SVG + Text
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-full w-auto">
        {/* Top Arc Blocks (Cyan/Blue) */}
        <path d="M25 35 L10 25 C15 15 25 8 38 5 L42 22 C35 24 30 28 25 35 Z" fill="#00AEEF" />
        <path d="M50 20 L55 3 C68 5 78 12 85 20 L72 30 C68 25 60 22 50 20 Z" fill="#00C4DF" />
        <path d="M80 35 L95 28 C98 35 100 45 98 55 L82 52 C82 46 82 40 80 35 Z" fill="#00C4DF" />
        
        {/* Bottom Arc Blocks (Cyan/Blue) */}
        <path d="M15 60 L2 65 C5 78 12 88 22 95 L30 80 C24 75 18 68 15 60 Z" fill="#00AEEF" />
        <path d="M40 85 L35 100 C48 102 60 98 70 90 L60 78 C54 82 46 84 40 85 Z" fill="#00C4DF" />
      </svg>

      {/* Text Part */}
      <div className="flex flex-col justify-center h-full">
        <span className={`font-black tracking-tighter leading-none ${lightMode ? 'text-white' : 'text-slate-900'} italic`} style={{ fontSize: '1.4em' }}>
          BUZZITECH
        </span>
        <span className={`font-bold tracking-widest leading-none mt-1 ${lightMode ? 'text-blue-200' : 'text-slate-600'}`} style={{ fontSize: '0.6em' }}>
          IT SOLUTIONS & SERVICES
        </span>
      </div>
    </div>
  );
};

export default Logo;