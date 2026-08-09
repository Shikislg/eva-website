import React from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';
import { assetUrl } from '../utils/assetUrl';
import './ProjectGrid.css';

export default function ProjectGrid({ category }) {
  const { projects } = useProjects();
  const { t } = useLanguage();

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
            <div className="project-card-image-wrapper">
              <img
                src={assetUrl(project.coverImage)}
                alt={project.title}
                className="project-card-image"
                loading="lazy"
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
