import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { CATEGORIES } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';
import ProjectGrid from '../components/ProjectGrid';
import './CategoryPage.css';

export default function CategoryPage() {
  const { category } = useParams();
  const { t } = useLanguage();
  const cat = CATEGORIES.find((c) => c.key === category);

  if (!cat) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>{t(`nav_${cat.key}`)}</h1>
      </div>
      <ProjectGrid category={category} />
    </div>
  );
}
