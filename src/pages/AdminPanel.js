import React, { useState } from 'react';
import { useProjects, CATEGORIES } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';
import './AdminPanel.css';

const ADMIN_PASSWORD = 'eva2026';

export default function AdminPanel() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { t } = useLanguage();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    category: CATEGORIES[0].key,
    description: '',
    coverImage: '',
    images: '',
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      year: new Date().getFullYear().toString(),
      category: CATEGORIES[0].key,
      description: '',
      coverImage: '',
      images: '',
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setForm({
      title: project.title,
      year: project.year,
      category: project.category || CATEGORIES[0].key,
      description: project.description,
      coverImage: project.coverImage,
      images: project.images.join('\n'),
    });
    setEditing(project.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const imageList = form.images
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean);

    const projectData = {
      title: form.title.trim(),
      year: form.year.trim(),
      category: form.category,
      description: form.description.trim(),
      coverImage: form.coverImage.trim(),
      images: imageList,
    };

    if (editing) {
      updateProject(editing, projectData);
    } else {
      addProject(projectData);
    }
    resetForm();
  };

  const handleDelete = (id, title) => {
    if (window.confirm(t('admin_delete_confirm')(title))) {
      deleteProject(id);
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <h2>{t('admin_title')}</h2>
          <p>{t('admin_subtitle')}</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('admin_password_placeholder')}
              autoFocus
            />
            {passwordError && <span className="admin-error">{t('admin_incorrect')}</span>}
            <button type="submit" className="btn-primary">
              {t('admin_enter')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h2>{t('admin_manage')}</h2>
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            {t('admin_new')}
          </button>
        </div>

        {showForm && (
          <form className="admin-form" onSubmit={handleSubmit}>
            <h3>{editing ? t('admin_edit_title') : t('admin_new_title')}</h3>
            <label>
              {t('admin_label_title')}
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder={t('admin_placeholder_title')}
              />
            </label>
            <label>
              {t('admin_label_year')}
              <input
                type="text"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                required
                placeholder={t('admin_placeholder_year')}
              />
            </label>
            <label>
              {t('admin_label_category')}
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('admin_label_description')}
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('admin_placeholder_desc')}
                rows={3}
              />
            </label>
            <label>
              {t('admin_label_cover')}
              <input
                type="url"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                required
                placeholder="https://..."
              />
            </label>
            {form.coverImage && (
              <div className="admin-preview">
                <img src={form.coverImage} alt="Cover preview" />
              </div>
            )}
            <label>
              {t('admin_label_images')}
              <textarea
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder={"https://image1.jpg\nhttps://image2.jpg\nhttps://image3.jpg"}
                rows={5}
              />
            </label>
            <div className="admin-form-actions">
              <button type="submit" className="btn-primary">
                {editing ? t('admin_save') : t('admin_add')}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                {t('admin_cancel')}
              </button>
            </div>
          </form>
        )}

        <div className="admin-project-list">
          {projects.length === 0 && (
            <p className="admin-empty">{t('admin_empty')}</p>
          )}
          {projects.map((project) => (
            <div key={project.id} className="admin-project-item">
              <div className="admin-project-thumb">
                <img src={project.coverImage} alt={project.title} />
              </div>
              <div className="admin-project-info">
                <h4>{project.title}</h4>
                <span>{project.year} &middot; {(CATEGORIES.find((c) => c.key === project.category) || {}).label || project.category} &middot; {project.images.length} {t('admin_photos')}</span>
              </div>
              <div className="admin-project-actions">
                <button className="btn-icon" onClick={() => handleEdit(project)} title="Edit">
                  ✎
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDelete(project.id, project.title)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
