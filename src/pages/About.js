import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './About.css';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="about-page">
      <div className="about-content">
        <h1>{t('about_title')}</h1>
        <div className="about-body">
          <p dangerouslySetInnerHTML={{ __html: t('about_p1') }} />
          <p>{t('about_p2')}</p>
          <p>{t('about_p3')}</p>
        </div>
      </div>
    </div>
  );
}
