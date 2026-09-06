import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export default function LanguageSwitcher({ className = '', style = {} }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`language-switcher ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(8px)',
        padding: '0.35rem 0.65rem',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        color: 'inherit',
        fontSize: '0.85rem',
        ...style
      }}
    >
      <Globe size={15} style={{ opacity: 0.9 }} />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: 'pointer',
          outline: 'none',
          paddingRight: '0.2rem'
        }}
        aria-label="Select Language"
      >
        {languages.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            style={{ background: '#1E293B', color: '#F8FAFC' }}
          >
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
