import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Hero.css';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <Link to="/work/sports" className="hero-half hero-left" aria-label={t('hero_sports_aria')}>
        <div className="hero-half-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1400&q=80')" }} />
        <span className="hero-half-label">{t('hero_sports')}</span>
      </Link>
      <Link to="/work/concerts" className="hero-half hero-right" aria-label={t('hero_concerts_aria')}>
        <div className="hero-half-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1400&q=80')" }} />
        <span className="hero-half-label">{t('hero_concerts')}</span>
      </Link>
      <div className="hero-center-overlay">
        <h1 className="hero-greeting">
          {t('hero_greeting_before')}<span className="hero-name">{t('hero_name')}</span>{t('hero_greeting_after')}
        </h1>
        <p className="hero-subtitle">{t('hero_subtitle')}</p>
      </div>
    </section>
  );
}
