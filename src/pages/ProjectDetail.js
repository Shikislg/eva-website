import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';
import './ProjectDetail.css';

/**
 * Lazy-loads the src only once the element is near the viewport.
 * For regular https:// URLs the native loading="lazy" attribute is enough.
 * For data: URLs (locally uploaded, not yet published) the browser ignores
 * loading="lazy", so we gate on IntersectionObserver instead.
 */
function LazyImage({ src, alt, onClick }) {
  const ref = useRef(null);
  const isDataUrl = src?.startsWith('data:');
  const [ready, setReady] = useState(!isDataUrl);

  useEffect(() => {
    if (!isDataUrl) { setReady(true); return; }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setReady(true); observer.disconnect(); } },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isDataUrl]);

  return (
    <img
      ref={ref}
      src={ready ? src : undefined}
      alt={alt}
      loading={isDataUrl ? undefined : 'lazy'}
      onClick={onClick}
    />
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { getProject } = useProjects();
  const { t } = useLanguage();
  const project = getProject(id);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (project) {
      setLightboxIndex((prev) => (prev + 1) % project.images.length);
    }
  }, [project]);

  const goPrev = useCallback(() => {
    if (project) {
      setLightboxIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    }
  }, [project]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, goNext, goPrev]);

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
          <div
            key={index}
            className="project-detail-image-wrapper"
            onClick={() => openLightbox(index)}
          >
            <LazyImage
              src={img}
              alt={`${project.title} - ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <div className="project-detail-footer">
        <Link to="/" className="back-link">
          {t('detail_back_to_work')}
        </Link>
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          >
            &#8249;
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={project.images[lightboxIndex]}
              alt={`${project.title} - ${lightboxIndex + 1}`}
            />
            <span className="lightbox-counter">
              {lightboxIndex + 1} / {project.images.length}
            </span>
          </div>
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          >
            &#8250;
          </button>
        </div>
      )}
    </div>
  );
}
