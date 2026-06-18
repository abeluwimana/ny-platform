// src/components/common/LanguageSwitcher.jsx
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
      background: 'transparent',
    }}>
      {supportedLanguages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: currentLanguage === lang.code ? '2px solid #ffc107' : '1px solid #ddd',
            background: currentLanguage === lang.code ? '#ffc107' : 'transparent',
            color: currentLanguage === lang.code ? '#1a1a1a' : '#666',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: currentLanguage === lang.code ? '700' : '400',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}