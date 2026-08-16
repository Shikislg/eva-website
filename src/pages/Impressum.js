import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './About.css';

export default function Impressum() {
  const { lang } = useLanguage();

  return (
    <div className="about-page">
      <div className="about-content impressum-content">
        {lang === 'de' ? <ImpressumDE /> : <ImpressumEN />}
      </div>
    </div>
  );
}

function ImpressumDE() {
  return (
    <>
      <h1>Impressum</h1>
      <div className="about-body">
        <p>
          <strong>Angaben gemäß § 5 TMG</strong>
        </p>
        <p>
          Eva Wagner<br />
          40235 Düsseldorf<br />
          Deutschland
        </p>
        <p>
          <strong>Kontakt</strong><br />
          {/* TODO: echte E-Mail-Adresse eintragen */}
          E-Mail: <a href="mailto:whateva.jpg@web.de">whateva.jpg@web.de</a>
        </p>
        <p>
          <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</strong><br />
          Eva Wagner<br />
          40235 Düsseldorf
        </p>
        <p>
          <strong>Haftungsausschluss</strong><br />
          Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann
          jedoch keine Gewähr übernommen werden.
        </p>
        <p>
          Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte auf
          diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8–10
          TMG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte
          oder gespeicherte fremde Informationen zu überwachen.
        </p>
        <p>
          <strong>Haftung für Links</strong><br />
          Meine Website enthält Links zu externen Websites Dritter, auf deren
          Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden
          Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
          Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
          verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung
          auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
          Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche
          Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte
          einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
          Rechtsverletzungen werde ich derartige Links umgehend entfernen.
        </p>
        <p>
          <strong>Urheberrecht</strong><br />
          Die durch mich erstellten Inhalte und Werke auf dieser Website
          unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
          Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
          Urheberrechtes bedürfen meiner schriftlichen Zustimmung.
        </p>
      </div>
    </>
  );
}

function ImpressumEN() {
  return (
    <>
      <h1>Legal Notice</h1>
      <div className="about-body">
        <p>
          <strong>Information pursuant to § 5 TMG (German Telemedia Act)</strong>
        </p>
        <p>
          Eva Wagner<br />
          40235 Düsseldorf<br />
          Germany
        </p>
        <p>
          <strong>Contact</strong><br />
          Email: <a href="mailto:whateva.jpg@web.de">whateva.jpg@web.de</a>
        </p>
        <p>
          <strong>Responsible for content pursuant to § 18 (2) MStV</strong><br />
          Eva Wagner<br />
          40235 Düsseldorf
        </p>
        <p>
          <strong>Disclaimer</strong><br />
          The contents of this website have been created with the utmost care.
          However, no warranty can be given for the accuracy, completeness, or
          timeliness of the information provided.
        </p>
        <p>
          As a service provider, I am responsible for my own content on these
          pages in accordance with general law (§ 7 (1) TMG). However, I am not
          obligated to monitor transmitted or stored third-party information
          (§§ 8-10 TMG).
        </p>
        <p>
          <strong>Liability for Links</strong><br />
          This website contains links to external third-party websites over whose
          content I have no control. I therefore cannot accept any liability for
          this external content. The respective provider or operator of the linked
          pages is always responsible for their content. The linked pages were
          checked for possible legal violations at the time of linking. No illegal
          content was apparent at the time of linking. A permanent review of the
          linked pages is not reasonable without concrete evidence of a legal
          violation. Upon notification of any such violation, I will remove the
          relevant links immediately.
        </p>
        <p>
          <strong>Copyright</strong><br />
          The content and works on this website are subject to German copyright
          law. Reproduction, editing, distribution, or any use beyond the limits
          of copyright law require my written consent.
        </p>
      </div>
    </>
  );
}
