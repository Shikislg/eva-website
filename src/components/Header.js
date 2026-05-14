import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const isAdmin = location.pathname.startsWith('/admin');
  const isWork = location.pathname.startsWith('/work');

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo" onClick={() => setMenuOpen(false)}>
          Eva Wagner
        </Link>
        <div className="header-right">
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
            <div
              className={`nav-dropdown ${workOpen ? 'open' : ''}`}
              onMouseEnter={() => setWorkOpen(true)}
              onMouseLeave={() => setWorkOpen(false)}
            >
              <button
                className={`nav-dropdown-trigger ${isWork ? 'active' : ''}`}
                onClick={() => setWorkOpen(!workOpen)}
                type="button"
              >
                {t('nav_work')}
                <svg
                  className={`dropdown-arrow ${workOpen ? 'flipped' : ''}`}
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 3.5L5 6.5L8 3.5" />
                </svg>
              </button>
              <div className="nav-dropdown-menu">
                <Link
                  to="/work/sports"
                  className={location.pathname === '/work/sports' ? 'active' : ''}
                  onClick={() => { setMenuOpen(false); setWorkOpen(false); }}
                >
                  {t('nav_sports')}
                </Link>
                <Link
                  to="/work/concerts"
                  className={location.pathname === '/work/concerts' ? 'active' : ''}
                  onClick={() => { setMenuOpen(false); setWorkOpen(false); }}
                >
                  {t('nav_concerts')}
                </Link>
              </div>
            </div>
            <Link
              to="/about"
              className={location.pathname === '/about' ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {t('nav_about')}
            </Link>
            <Link
              to="/contact"
              className={location.pathname === '/contact' ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {t('nav_contact')}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="active"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav_admin')}
              </Link>
            )}
          </nav>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
