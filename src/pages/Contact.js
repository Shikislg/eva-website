import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Contact.css';

function encodeFormData(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  // 'idle' | 'sending' | 'success' | 'error'
  const [status, setStatus] = useState('idle');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormData({ 'form-name': 'contact', ...form }),
      });
      if (!res.ok) throw new Error(`Submission failed (${res.status})`);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-content">
        <h1>{t('contact_title')}</h1>
        <p className="contact-intro">
          {t('contact_intro')}
        </p>

        <form
          className="contact-form"
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="form-name" value="contact" />
          <p className="contact-form-honeypot">
            <label>
              Don’t fill this out if you’re human: <input name="bot-field" tabIndex="-1" autoComplete="off" />
            </label>
          </p>

          <label className="contact-form-label">
            <span className="contact-form-label-text">{t('contact_form_name')} <span className="contact-form-required">*</span></span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange('name')}
              placeholder={t('contact_form_name_placeholder')}
              required
            />
          </label>

          <label className="contact-form-label">
            <span className="contact-form-label-text">{t('contact_form_email')} <span className="contact-form-required">*</span></span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder={t('contact_form_email_placeholder')}
              required
            />
          </label>

          <label className="contact-form-label">
            <span className="contact-form-label-text">{t('contact_form_message')} <span className="contact-form-required">*</span></span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange('message')}
              placeholder={t('contact_form_message_placeholder')}
              rows={6}
              required
            />
          </label>

          <button type="submit" className="contact-form-submit" disabled={status === 'sending'}>
            {status === 'sending' ? t('contact_form_sending') : t('contact_form_submit')}
          </button>

          {status === 'success' && <p className="contact-form-status contact-form-success">{t('contact_form_success')}</p>}
          {status === 'error' && <p className="contact-form-status contact-form-error">{t('contact_form_error')}</p>}
        </form>

        <div className="contact-details">
          <span className="contact-or">{t('contact_form_or')}</span>
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
