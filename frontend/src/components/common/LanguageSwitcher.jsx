import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';


const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export default function LanguageSwitcher({ className = '', style = {}, direction = 'down' }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const selectedLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className={`language-switcher ${className}`} style={{ position: 'relative', display: 'flex', ...style }}>
      {/* Invisible backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
        />
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          background: isOpen ? 'rgba(37,99,235,0.2)' : 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
          padding: '0 0.75rem',
          height: 38,
          borderRadius: '10px',
          border: `1px solid ${isOpen ? 'rgba(59,130,246,0.5)' : 'rgba(255, 255, 255, 0.18)'}`,
          color: isOpen ? '#60A5FA' : 'white',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
          whiteSpace: 'nowrap',
          width: style.width ? '100%' : 'auto',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          if(!isOpen) {
             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
             e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if(!isOpen) {
             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
             e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
          }
        }}
      >
        <Globe size={15} style={{ opacity: 0.9, flexShrink: 0 }} />
        <span style={{ whiteSpace: 'nowrap' }}>{selectedLang.flag} {selectedLang.label}</span>
        <ChevronDown size={13} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: direction === 'down' ? 'calc(100% + 0.5rem)' : 'auto',
          bottom: direction === 'up' ? 'calc(100% + 0.5rem)' : 'auto',
          left: 0,
          minWidth: 140,
          background: 'rgba(15,23,42,0.96)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '0.4rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: language === lang.code ? 'rgba(37,99,235,0.2)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: language === lang.code ? '#60A5FA' : '#E2E8F0',
                fontSize: '0.875rem',
                fontWeight: language === lang.code ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (language !== lang.code) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                if (language !== lang.code) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '1rem' }}>{lang.flag}</span> 
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
