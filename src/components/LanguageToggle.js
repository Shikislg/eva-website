import React from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-toggle">
      {LANGUAGES.map((l, i) => (
        <React.Fragment key={l.code}>
          {i > 0 && <span className="lang-sep">/</span>}
          <button
            className={`lang-btn ${lang === l.code ? 'active' : ''}`}
            onClick={() => setLang(l.code)}
            aria-label={`Switch to ${l.label}`}
          >
            {l.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
