import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useProjects, CATEGORIES } from '../context/ProjectContext';
import { useLanguage } from '../context/LanguageContext';
import { compressImageToDataURL } from '../utils/imageUtils';
import './AdminPanel.css';

const DEFAULT_GH_SETTINGS = {
  owner: 'Shikislg',
  repo: 'eva-website',
  branch: 'master',
  pathPrefix: 'public',
  apiSecret: '',
};

export default function AdminPanel() {
  const { projects, addProject, updateProject, deleteProject, publishToGitHub } = useProjects();
  const { t } = useLanguage();
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('admin_auth') === '1'
  );
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const [imagesDragOver, setImagesDragOver] = useState(false);
  const coverInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const [cropModal, setCropModal] = useState(null);
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [cropAspect, setCropAspect] = useState(null);
  const cropContainerRef = useRef(null);
  const cropImgRef = useRef(null);
  const dragRef = useRef(null);

  // GitHub publish settings (persisted in sessionStorage, cleared on tab close)
  const [ghSettings, setGhSettings] = useState(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('gh_settings') || 'null');
      if (!stored) return DEFAULT_GH_SETTINGS;
      return { ...DEFAULT_GH_SETTINGS, ...stored };
    } catch {
      return DEFAULT_GH_SETTINGS;
    }
  });
  const [showGhSettings, setShowGhSettings] = useState(false);
  const [publishProgress, setPublishProgress] = useState(null); // { step, total, message }
  const [publishError, setPublishError] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Persist GitHub settings to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('gh_settings', JSON.stringify(ghSettings));
  }, [ghSettings]);

  const [form, setForm] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    category: CATEGORIES[0].key,
    description: '',
    coverImage: '',
    images: '',
  });

  // Compress a cover image (800 px wide max, 88 % quality) – keeps files small
  // while preserving enough detail for a portfolio hero image.
  const readCoverFile = useCallback(
    (file) => compressImageToDataURL(file, 1200, 1200, 0.88),
    []
  );

  // Compress gallery images (1920 px wide max, 82 % quality).
  const readGalleryFile = useCallback(
    (file) => compressImageToDataURL(file, 1920, 1920, 0.82),
    []
  );

  const handleCoverDrop = useCallback(async (e) => {
    e.preventDefault();
    setCoverDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const dataURL = await readCoverFile(file);
      setForm((prev) => ({ ...prev, coverImage: dataURL }));
    }
  }, [readCoverFile]);

  const handleImagesDrop = useCallback(async (e) => {
    e.preventDefault();
    setImagesDragOver(false);
    const files = Array.from(e.dataTransfer?.files || e.target?.files || []).filter((f) =>
      f.type.startsWith('image/')
    );
    // Process in batches of 5 to avoid locking up the UI with large drops
    const dataURLs = [];
    for (let i = 0; i < files.length; i += 5) {
      const batch = files.slice(i, i + 5);
      const results = await Promise.all(batch.map(readGalleryFile));
      dataURLs.push(...results);
    }
    setForm((prev) => {
      const existing = prev.images ? prev.images.split('\n').filter(Boolean) : [];
      return { ...prev, images: [...existing, ...dataURLs].join('\n') };
    });
  }, [readGalleryFile]);

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const openCrop = (src, type, index) => {
    setCropModal({ src, type, index });
    setCrop({ x: 5, y: 5, w: 90, h: 90 });
    setCropAspect(null);
  };

  const applyCrop = () => {
    if (!cropModal) return;
    const img = new Image();
    img.onload = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const sx = (crop.x / 100) * nw;
      const sy = (crop.y / 100) * nh;
      const sw = (crop.w / 100) * nw;
      const sh = (crop.h / 100) * nh;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const cropped = canvas.toDataURL('image/jpeg', 0.92);
      if (cropModal.type === 'cover') {
        setForm((prev) => ({ ...prev, coverImage: cropped }));
      } else {
        setForm((prev) => {
          const imgs = prev.images.split('\n').filter(Boolean);
          imgs[cropModal.index] = cropped;
          return { ...prev, images: imgs.join('\n') };
        });
      }
      setCropModal(null);
    };
    img.src = cropModal.src;
  };

  const changeCropAspect = (ratio) => {
    setCropAspect(ratio);
    if (ratio && cropImgRef.current) {
      const { naturalWidth, naturalHeight } = cropImgRef.current;
      setCrop((prev) => {
        let newW = prev.w;
        let newH = (newW * naturalWidth) / (ratio * naturalHeight);
        if (prev.y + newH > 100) {
          newH = 100 - prev.y;
          newW = (newH * ratio * naturalHeight) / naturalWidth;
        }
        if (prev.x + newW > 100) {
          newW = 100 - prev.x;
          newH = (newW * naturalWidth) / (ratio * naturalHeight);
        }
        return { ...prev, w: Math.max(10, newW), h: Math.max(10, newH) };
      });
    }
  };

  const handleCropMouseDown = (e, handleType) => {
    e.preventDefault();
    e.stopPropagation();
    const container = cropContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    dragRef.current = {
      type: handleType,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
      containerW: rect.width,
      containerH: rect.height,
    };

    const onMove = (ev) => {
      if (!dragRef.current) return;
      const { type, startX, startY, startCrop, containerW, containerH } = dragRef.current;
      const dx = ((ev.clientX - startX) / containerW) * 100;
      const dy = ((ev.clientY - startY) / containerH) * 100;
      let next = { ...startCrop };
      const img = cropImgRef.current;
      const nw = img?.naturalWidth || 1;
      const nh = img?.naturalHeight || 1;

      if (type === 'move') {
        next.x = clamp(startCrop.x + dx, 0, 100 - startCrop.w);
        next.y = clamp(startCrop.y + dy, 0, 100 - startCrop.h);
      } else {
        const isTop = type.includes('n');
        const isLeft = type.includes('w');

        if (isLeft) {
          const newX = clamp(startCrop.x + dx, 0, startCrop.x + startCrop.w - 10);
          next.w = startCrop.x + startCrop.w - newX;
          next.x = newX;
        } else {
          next.w = clamp(startCrop.w + dx, 10, 100 - startCrop.x);
        }

        if (isTop) {
          const newY = clamp(startCrop.y + dy, 0, startCrop.y + startCrop.h - 10);
          next.h = startCrop.y + startCrop.h - newY;
          next.y = newY;
        } else {
          next.h = clamp(startCrop.h + dy, 10, 100 - startCrop.y);
        }

        if (cropAspect) {
          const targetH = (next.w * nw) / (cropAspect * nh);
          if (isTop) {
            const bottom = next.y + next.h;
            next.h = clamp(targetH, 10, bottom);
            next.y = bottom - next.h;
          } else {
            next.h = clamp(targetH, 10, 100 - next.y);
          }
        }
      }
      setCrop(next);
    };

    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setPasswordError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem('admin_auth', '1');
        setAuthenticated(true);
      } else {
        setPasswordError('Incorrect password');
      }
    } catch {
      setPasswordError('Could not reach server. Is the backend running?');
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

  const handlePublish = async () => {
    const { apiSecret } = ghSettings;
    if (!apiSecret) {
      setShowGhSettings(true);
      setPublishError('Enter the publish secret before publishing.');
      return;
    }
    setPublishError('');
    setPublishSuccess(false);
    setPublishProgress({ step: 0, total: 1, message: 'Connecting to GitHub…' });
    try {
      await publishToGitHub(ghSettings, (p) => setPublishProgress(p));
      setPublishSuccess(true);
    } catch (err) {
      setPublishError(err.message || 'Publish failed. Check your GitHub settings.');
    } finally {
      setPublishProgress(null);
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
          <div className="admin-header-actions">
            <button
              className="btn-secondary btn-github"
              onClick={() => {
                setShowGhSettings((v) => !v);
                setPublishError('');
                setPublishSuccess(false);
              }}
              title="GitHub publish settings"
            >
              ⬆ GitHub
            </button>
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
        </div>

        {/* GitHub publish panel */}
        {showGhSettings && (
          <div className="gh-settings-panel">
            <h4 className="gh-settings-title">Publish to GitHub</h4>
            <label className="gh-secret-label">
              Publish secret
              <input
                type="password"
                value={ghSettings.apiSecret}
                onChange={(e) => setGhSettings((s) => ({ ...s, apiSecret: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
                autoFocus
              />
            </label>

            {publishProgress && (
              <div className="gh-progress">
                <div
                  className="gh-progress-bar"
                  style={{ width: `${Math.round((publishProgress.step / publishProgress.total) * 100)}%` }}
                />
                <span className="gh-progress-label">{publishProgress.message}</span>
              </div>
            )}
            {publishError && <p className="gh-error">{publishError}</p>}
            {publishSuccess && (
              <p className="gh-success">
                ✓ Published! Changes are usually live within a few minutes.
              </p>
            )}

            <div className="gh-settings-actions">
              <button
                className="btn-primary"
                onClick={handlePublish}
                disabled={!!publishProgress}
              >
                {publishProgress ? 'Publishing…' : 'Publish'}
              </button>
              <button className="btn-secondary" onClick={() => setShowGhSettings(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

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
            <label>{t('admin_label_cover')}</label>
            <div
              className={`admin-dropzone${coverDragOver ? ' dragover' : ''}`}
              onDragOver={(e) => { preventDefaults(e); setCoverDragOver(true); }}
              onDragEnter={(e) => { preventDefaults(e); setCoverDragOver(true); }}
              onDragLeave={() => setCoverDragOver(false)}
              onDrop={handleCoverDrop}
              onClick={() => coverInputRef.current?.click()}
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverDrop}
                hidden
              />
              {form.coverImage ? (
                <div className="admin-dropzone-preview">
                  <img src={form.coverImage} alt="Cover preview" onClick={(e) => { e.stopPropagation(); openCrop(form.coverImage, 'cover', 0); }} />
                  <span className="admin-dropzone-change">Click image to crop · Drop to replace</span>
                </div>
              ) : (
                <div className="admin-dropzone-placeholder">
                  <span className="admin-dropzone-icon">⇧</span>
                  <span>Drop image here or click to browse</span>
                </div>
              )}
            </div>
            <div className="admin-dropzone-or">or paste a URL</div>
            <input
              type="url"
              value={form.coverImage.startsWith('data:') ? '' : form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              placeholder="https://..."
            />
            <label>{t('admin_label_images')}</label>
            <div
              className={`admin-dropzone admin-dropzone-multi${imagesDragOver ? ' dragover' : ''}`}
              onDragOver={(e) => { preventDefaults(e); setImagesDragOver(true); }}
              onDragEnter={(e) => { preventDefaults(e); setImagesDragOver(true); }}
              onDragLeave={() => setImagesDragOver(false)}
              onDrop={handleImagesDrop}
              onClick={() => imagesInputRef.current?.click()}
            >
              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesDrop}
                hidden
              />
              <div className="admin-dropzone-placeholder">
                <span className="admin-dropzone-icon">⇧</span>
                <span>Drop images here or click to browse</span>
              </div>
            </div>
            {form.images && (
              <div className="admin-dropped-previews">
                {form.images.split('\n').filter(Boolean).map((src, i) => (
                  <div key={i} className="admin-dropped-thumb">
                    <img
                      src={src}
                      alt={`Upload ${i + 1}`}
                      onClick={(e) => { e.stopPropagation(); openCrop(src, 'gallery', i); }}
                      title="Click to crop"
                    />
                    <button
                      type="button"
                      className="admin-dropped-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.split('\n').filter((_, j) => j !== i).join('\n'),
                        }));
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="admin-dropzone-or">or paste URLs (one per line)</div>
            <textarea
              value={form.images.split('\n').filter((u) => !u.startsWith('data:')).join('\n')}
              onChange={(e) => {
                const dataUrls = form.images.split('\n').filter((u) => u.startsWith('data:'));
                const pasted = e.target.value;
                setForm({ ...form, images: [...dataUrls, ...pasted.split('\n')].filter(Boolean).join('\n') });
              }}
              placeholder={"https://image1.jpg\nhttps://image2.jpg"}
              rows={3}
            />
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

      {cropModal && (
        <div className="crop-overlay" onClick={() => setCropModal(null)}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crop-toolbar">
              <div className="crop-aspects">
                {[
                  { label: 'Free', value: null },
                  { label: '16:9', value: 16 / 9 },
                  { label: '4:3', value: 4 / 3 },
                  { label: '3:2', value: 3 / 2 },
                  { label: '1:1', value: 1 },
                ].map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    className={`crop-aspect-btn${cropAspect === a.value ? ' active' : ''}`}
                    onClick={() => changeCropAspect(a.value)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="crop-actions">
                <button type="button" className="btn-primary" onClick={applyCrop}>
                  Apply
                </button>
                <button type="button" className="btn-secondary" onClick={() => setCropModal(null)}>
                  Cancel
                </button>
              </div>
            </div>
            <div className="crop-area" ref={cropContainerRef}>
              <img
                ref={cropImgRef}
                src={cropModal.src}
                alt="Crop"
                className="crop-image"
                draggable={false}
              />
              <div className="crop-darken" style={{ top: 0, left: 0, right: 0, height: `${crop.y}%` }} />
              <div className="crop-darken" style={{ top: `${crop.y + crop.h}%`, left: 0, right: 0, bottom: 0 }} />
              <div className="crop-darken" style={{ top: `${crop.y}%`, left: 0, width: `${crop.x}%`, height: `${crop.h}%` }} />
              <div className="crop-darken" style={{ top: `${crop.y}%`, right: 0, left: `${crop.x + crop.w}%`, height: `${crop.h}%` }} />
              <div
                className="crop-selection"
                style={{ top: `${crop.y}%`, left: `${crop.x}%`, width: `${crop.w}%`, height: `${crop.h}%` }}
                onMouseDown={(e) => handleCropMouseDown(e, 'move')}
              >
                <div className="crop-handle nw" onMouseDown={(e) => handleCropMouseDown(e, 'nw')} />
                <div className="crop-handle ne" onMouseDown={(e) => handleCropMouseDown(e, 'ne')} />
                <div className="crop-handle sw" onMouseDown={(e) => handleCropMouseDown(e, 'sw')} />
                <div className="crop-handle se" onMouseDown={(e) => handleCropMouseDown(e, 'se')} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
