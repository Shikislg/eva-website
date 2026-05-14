import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const { getProject } = useProjects();
  const { t } = useLanguage();
  const project = getProject(id);

  if (!project) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="project-detail">
      <div className="project-detail-header">
        <Link to="/" className="back-link">
          {t('detail_back')}
        </Link>
        <div className="project-detail-title-block">
          <h1>{project.title}</h1>
          <span className="project-detail-year">{project.year}</span>
        </div>
        {project.description && (
          <p className="project-detail-desc">{project.description}</p>
        )}
      </div>
      <div className="project-detail-images">
        {project.images.map((img, index) => (
          <div key={index} className="project-detail-image-wrapper">
            <img
              src={img}
              alt={`${project.title} - ${index + 1}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <div className="project-detail-footer">
        <Link to="/" className="back-link">
          {t('detail_back_to_work')}
        </Link>
      </div>
    </div>
  );
}
