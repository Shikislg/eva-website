import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const translations = {
  en: {
    // Nav
    nav_work: 'Work',
    nav_sports: 'Sports',
    nav_concerts: 'Concerts',
    nav_about: 'About',
    nav_contact: 'Contact',
    nav_admin: 'Admin',

    // Hero
    hero_greeting_before: "Hey, I'm ",
    hero_name: 'Eva',
    hero_greeting_after: '.',
    hero_subtitle_before: 'capturing e',
    hero_subtitle_highlight: '𝗆𝗈𝗍𝗂𝗈𝗇.',
    hero_sports: 'Sports',
    hero_concerts: 'Concerts',
    hero_sports_aria: 'View Sports portfolio',
    hero_concerts_aria: 'View Concerts portfolio',

    // About
    about_title: 'About',
    about_p1: "I'm <strong>Eva Wagner</strong> — a photographer based in Germany with a passion for capturing authentic moments and visual stories. I focus on sports and concert photography, where I find endless inspiration in the energy,",
    about_p2: "I believe every frame tells a story. Whether it's the quiet beauty of a natural landscape or the raw energy of a live event, I strive to create images that resonate and endure.",
    about_p3: 'Currently available for commissions, collaborations, and creative projects.',

    // Contact
    contact_title: 'Contact',
    contact_intro: "Interested in working together? I'd love to hear from you.",
    contact_instagram: 'Instagram',
    contact_linkedin: 'LinkedIn',

    // Project Detail
    detail_back: '← Back',
    detail_back_to_work: '← Back to Work',

    // Project Grid
    grid_empty: 'No projects yet. Add some in the admin panel.',

    // Footer
    footer_copy: 'Eva Wagner',

    // Admin
    admin_title: 'Admin Access',
    admin_subtitle: 'Enter the password to manage your portfolio.',
    admin_password_placeholder: 'Password',
    admin_enter: 'Enter',
    admin_incorrect: 'Incorrect password',
    admin_manage: 'Manage Portfolio',
    admin_new: '+ New Project',
    admin_edit_title: 'Edit Project',
    admin_new_title: 'New Project',
    admin_label_title: 'Title',
    admin_label_year: 'Year',
    admin_label_category: 'Category',
    admin_label_description: 'Description',
    admin_label_cover: 'Cover Image URL',
    admin_label_images: 'Project Image URLs (one per line)',
    admin_placeholder_title: 'e.g. Urban Landscapes',
    admin_placeholder_year: 'e.g. 2026',
    admin_placeholder_desc: 'Brief description of the project...',
    admin_save: 'Save Changes',
    admin_add: 'Add Project',
    admin_cancel: 'Cancel',
    admin_empty: 'No projects yet. Click "+ New Project" to add one.',
    admin_photos: 'photos',
    admin_delete_confirm: (title) => `Delete "${title}"? This cannot be undone.`,
  },
  de: {
    // Nav
    nav_work: 'Arbeit',
    nav_sports: 'Sport',
    nav_concerts: 'Konzerte',
    nav_about: 'Über mich',
    nav_contact: 'Kontakt',
    nav_admin: 'Admin',

    // Hero
    hero_greeting_before: 'Hey, ich bin ',
    hero_name: 'Eva',
    hero_greeting_after: '.',
    hero_subtitle_before: 'capturing e',
    hero_subtitle_highlight: 'motion.',
    hero_sports: 'Sport',
    hero_concerts: 'Live-Shows',
    hero_sports_aria: 'Sport-Portfolio ansehen',
    hero_concerts_aria: 'Konzert-Portfolio ansehen',

    // About
    about_title: 'Über mich',
    about_p1: 'Ich bin <strong>Eva Wagner</strong> — eine in Deutschland ansässige Fotografin mit einer Leidenschaft für authentische Momente und visuelle Geschichten. Mein Schwerpunkt liegt auf Sport- und Konzertfotografie, wo ich endlose Inspiration in der Energie finde.',
    about_p2: 'Ich glaube, dass jedes Bild eine Geschichte erzählt. Ob die stille Schönheit einer Naturlandschaft oder die rohe Energie eines Live-Events — ich strebe danach, Bilder zu schaffen, die berühren und bleiben.',
    about_p3: 'Derzeit verfügbar für Aufträge, Kooperationen und kreative Projekte.',

    // Contact
    contact_title: 'Kontakt',
    contact_intro: 'Interesse an einer Zusammenarbeit? Ich freue mich von Ihnen zu hören.',
    contact_instagram: 'Instagram',
    contact_linkedin: 'LinkedIn',

    // Project Detail
    detail_back: '← Zurück',
    detail_back_to_work: '← Zurück zur Arbeit',

    // Project Grid
    grid_empty: 'Noch keine Projekte. Fügen Sie welche im Admin-Bereich hinzu.',

    // Footer
    footer_copy: 'Eva Wagner',

    // Admin
    admin_title: 'Admin-Zugang',
    admin_subtitle: 'Passwort eingeben, um Ihr Portfolio zu verwalten.',
    admin_password_placeholder: 'Passwort',
    admin_enter: 'Eintreten',
    admin_incorrect: 'Falsches Passwort',
    admin_manage: 'Portfolio verwalten',
    admin_new: '+ Neues Projekt',
    admin_edit_title: 'Projekt bearbeiten',
    admin_new_title: 'Neues Projekt',
    admin_label_title: 'Titel',
    admin_label_year: 'Jahr',
    admin_label_category: 'Kategorie',
    admin_label_description: 'Beschreibung',
    admin_label_cover: 'Titelbild-URL',
    admin_label_images: 'Projekt-Bild-URLs (eine pro Zeile)',
    admin_placeholder_title: 'z.B. Stadtlandschaften',
    admin_placeholder_year: 'z.B. 2026',
    admin_placeholder_desc: 'Kurze Beschreibung des Projekts...',
    admin_save: 'Änderungen speichern',
    admin_add: 'Projekt hinzufügen',
    admin_cancel: 'Abbrechen',
    admin_empty: 'Noch keine Projekte. Klicken Sie auf "+ Neues Projekt".',
    admin_photos: 'Fotos',
    admin_delete_confirm: (title) => `"${title}" löschen? Dies kann nicht rückgängig gemacht werden.`,
  },
};

export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('eva_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('eva_lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = useCallback(
    (key) => {
      return translations[lang]?.[key] ?? translations.en?.[key] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
