import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import footballImg from '../img/DSC00747.jpg';
import concertImg from '../img/DSC03813-2.jpg';
import './Hero.css';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <Link to="/work/sports" className="hero-half hero-left" aria-label={t('hero_sports_aria')}>
        <div className="hero-half-bg" style={{ backgroundImage: `url(${footballImg})` }} />
        <span className="hero-half-label">{t('hero_sports')}</span>
      </Link>
      <Link to="/work/concerts" className="hero-half hero-right" aria-label={t('hero_concerts_aria')}>
        <div className="hero-half-bg" style={{ backgroundImage: `url(${concertImg})` }} />
        <span className="hero-half-label">{t('hero_concerts')}</span>
      </Link>
      <div className="hero-center-overlay">
        <h1 className="hero-greeting">
          {t('hero_greeting_before')}<span className="hero-name">{t('hero_name')}</span>{t('hero_greeting_after')}
        </h1>
        <p className="hero-subtitle">{t('hero_subtitle_before')}<span className="hero-subtitle-highlight">{t('hero_subtitle_highlight')}</span></p>
      </div>
    </section>
  );
}
