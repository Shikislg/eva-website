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
    about_p1: "I am Eva – a music enthusiast who spends her weekends in football stadiums, supporting my favourite clubs Fortuna Düsseldorf and SV Elversberg. I have always been the one who anticipated moments and captured them: first with my phone, then more seriously once I started photographing the university football team – a passion project I already did social media for. Seeing people’s faces light up when they looked at my photos made me realize how fulfilling this could be. I discovered that, with photography, I could combine the exhilarating energy of two things I am deeply passionate about: concerts and football.",
    about_p2: "Growing up as a fangirl who adores pop music and becoming a football fan only after turning 18, I noticed that those two groups of fans have much more in common than many people think; but one in particular is the feeling of being in the moment. Whether it’s dancing around to your favourite song being performed live or the electrifying seconds just before a penalty: <em class=\"about-emotion\">I love to capture emotion.</em>",
    about_p3: 'If you like my work or are interested in collaborating, feel free to contact me!',

    // Contact
    contact_title: 'Contact',
    contact_intro: "Interested in working together? I'd love to hear from you.",
    contact_instagram: 'Instagram',
    contact_linkedin: 'LinkedIn',
    contact_form_name: 'Name',
    contact_form_name_placeholder: 'Your name...',
    contact_form_email: 'Email Address',
    contact_form_email_placeholder: 'Your email address...',
    contact_form_message: 'Message',
    contact_form_message_placeholder: 'Your message...',
    contact_form_submit: 'Submit',
    contact_form_sending: 'Sending…',
    contact_form_success: "Thanks! Your message is on its way.",
    contact_form_error: 'Something went wrong — please try emailing directly instead.',
    contact_form_or: 'Or reach out directly',

    // Project Detail
    detail_back: '← Back',
    detail_back_to_work: '← Back to Work',

    // Project Grid
    grid_empty: 'No projects yet. Add some in the admin panel.',

    // Footer
    footer_copy: 'Eva Wagner',
    footer_impressum: 'Legal Notice',

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
    about_p1: 'Ich bin Eva – eine Musikenthusiastin, die ihre Wochenenden in Fußballstadien verbringt, um meine Lieblingsvereine Fortuna Düsseldorf und SV Elversberg anzufeuern. Ich war schon immer jemand, der besondere Momente antizipieren und festhalten konnte: zuerst mit meinem Handy, später dann professioneller, als ich anfing, ein Fußballteam meiner Universität zu fotografieren – ein Herzensprojekt, für das ich bereits den Instagram-Account betreute. Die Freude der Menschen zu sehen, wenn sie meine Fotos anschauten, machte mir klar, wie erfüllend das sein kann. Ich entdeckte, dass ich mit der Fotografie die mitreißende Energie zweier Dinge verbinden konnte, für die ich eine tiefe Leidenschaft habe: Konzerte und Fußball.',
    about_p2: 'Aufgewachsen als Fangirl, welches Popmusik liebt, und als Fußballfan – erst seit meinem 18. Lebensjahr – ist mir aufgefallen, dass beiden Fangruppen viel mehr gemeinsam haben, als viele Menschen denken; vor allem ist es das Gefühl, ganz im Moment zu sein. Ob man nun zu seinem Lieblingssong tanzt, der live gespielt wird, oder die elektrisierenden Sekunden kurz vor einem Elfmeter erlebt: <em class="about-emotion">I love to capture emotion.</em>',
    about_p3: 'Wenn dir meine Arbeit gefällt oder du an einer Zusammenarbeit interessiert bist, melde dich gerne bei mir!',

    // Contact
    contact_title: 'Kontakt',
    contact_intro: 'Interesse an einer Zusammenarbeit? Ich freue mich von Ihnen zu hören.',
    contact_instagram: 'Instagram',
    contact_linkedin: 'LinkedIn',
    contact_form_name: 'Name',
    contact_form_name_placeholder: 'Ihr Name...',
    contact_form_email: 'E-Mail-Adresse',
    contact_form_email_placeholder: 'Ihre E-Mail-Adresse...',
    contact_form_message: 'Nachricht',
    contact_form_message_placeholder: 'Ihre Nachricht...',
    contact_form_submit: 'Absenden',
    contact_form_sending: 'Wird gesendet…',
    contact_form_success: 'Danke! Ihre Nachricht ist unterwegs.',
    contact_form_error: 'Etwas ist schiefgelaufen — bitte schreiben Sie stattdessen direkt eine E-Mail.',
    contact_form_or: 'Oder direkt Kontakt aufnehmen',

    // Project Detail
    detail_back: '← Zurück',
    detail_back_to_work: '← Zurück zur Arbeit',

    // Project Grid
    grid_empty: 'Noch keine Projekte. Fügen Sie welche im Admin-Bereich hinzu.',

    // Footer
    footer_copy: 'Eva Wagner',
    footer_impressum: 'Impressum',

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
