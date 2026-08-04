import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';
import './ProjectGrid.css';

export default function ProjectGrid({ category }) {
  const { projects } = useProjects();
  const { t } = useLanguage();
  // Cover images are shown at their own aspect ratio (measured on load) instead of a
  // fixed crop, so object-fit: cover has nothing left to crop — the whole image fits.
  const [aspectRatios, setAspectRatios] = useState({});

  const handleCoverLoad = (id) => (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setAspectRatios((prev) => ({ ...prev, [id]: naturalWidth / naturalHeight }));
    }
  };

  const filtered = category
    ? projects.filter((p) => p.category === category)
    : projects;

  if (filtered.length === 0) {
    return (
      <section id="work" className="project-grid-section">
        <p className="no-projects">{t('grid_empty')}</p>
      </section>
    );
  }

  return (
    <section id="work" className="project-grid-section">
      <div className="project-grid">
        {filtered.map((project) => (
          <Link
            to={`/project/${project.id}`}
            key={project.id}
            className="project-card"
          >
            <div
              className="project-card-image-wrapper"
              style={aspectRatios[project.id] ? { aspectRatio: aspectRatios[project.id] } : undefined}
            >
              <img
                src={project.coverImage}
                alt={project.title}
                className="project-card-image"
                loading="lazy"
                onLoad={handleCoverLoad(project.id)}
              />
              <div className="project-card-overlay">
                <h3 className="project-card-title">{project.title}</h3>
                <span className="project-card-year">{project.year}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
