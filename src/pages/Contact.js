import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Contact.css';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <div className="contact-page">
      <div className="contact-content">
        <h1>{t('contact_title')}</h1>
        <p className="contact-intro">
          {t('contact_intro')}
        </p>
        <div className="contact-details">
          <a href="mailto:whateva.jpg@web.de" className="contact-link">
            whateva.jpg@web.de
          </a>
          <div className="contact-socials">
            <a href="https://www.instagram.com/whateva.jpg/" target="_blank" rel="noopener noreferrer">
              {t('contact_instagram')}
            </a>
            <a href="https://www.linkedin.com/in/eva-wagner-55819b357/" target="_blank" rel="noopener noreferrer">
              {t('contact_linkedin')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
