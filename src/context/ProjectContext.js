import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ProjectContext = createContext();

const DB_NAME = 'eva_portfolio_db';
const DB_VERSION = 1;
const DB_STORE = 'data';
const LEGACY_STORAGE_KEY = 'eva_portfolio_projects';
const LEGACY_VERSION_KEY = 'eva_portfolio_version';

export const CATEGORIES = [
  { key: 'sports', label: 'Sports' },
  { key: 'concerts', label: 'Concerts' },
];

const defaultProjects = [
  {
    id: uuidv4(),
    title: 'Bundesliga Match Day',
    year: '2026',
    category: 'sports',
    description: 'Capturing the intensity and passion of Bundesliga football — from tackles to celebrations.',
    coverImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80',
    ],
    order: 0,
  },
  {
    id: uuidv4(),
    title: 'Track & Field',
    year: '2026',
    category: 'sports',
    description: 'Speed, form, and determination — athletics captured in the decisive moment.',
    coverImage: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=1200&q=80',
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80',
      'https://images.unsplash.com/photo-1461896836934-bd45ba53a0e7?w=1200&q=80',
    ],
    order: 1,
  },
  {
    id: uuidv4(),
    title: 'Basketball Season',
    year: '2025',
    category: 'sports',
    description: 'Court-side perspectives from an electrifying basketball season.',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80',
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80',
    ],
    order: 2,
  },
  {
    id: uuidv4(),
    title: 'Summer Festival',
    year: '2026',
    category: 'concerts',
    description: 'Lights, energy, and crowd euphoria at one of Germany\'s biggest outdoor music festivals.',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    ],
    order: 3,
  },
  {
    id: uuidv4(),
    title: 'Intimate Acoustic',
    year: '2025',
    category: 'concerts',
    description: 'Small-venue sessions where the music feels close enough to touch.',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80',
    ],
    order: 4,
  },
  {
    id: uuidv4(),
    title: 'Arena Nights',
    year: '2025',
    category: 'concerts',
    description: 'Massive stages, roaring crowds, and artists in their element under arena lights.',
    coverImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80',
    ],
    order: 5,
  },
];

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(defaultProjects);
  const loaded = useRef(false);

  // Load from IndexedDB on mount, migrate from localStorage if needed
  useEffect(() => {
    (async () => {
      try {
        // Migrate from localStorage if data exists there
        const lsData = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (lsData) {
          try {
            const parsed = JSON.parse(lsData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              await idbSet('projects', parsed);
              setProjects(parsed);
            }
          } catch {}
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          localStorage.removeItem(LEGACY_VERSION_KEY);
        } else {
          const stored = await idbGet('projects');
          if (Array.isArray(stored) && stored.length > 0) {
            setProjects(stored);
          }
        }
      } catch {}
      loaded.current = true;
    })();
  }, []);

  // Save to IndexedDB whenever projects change
  useEffect(() => {
    if (loaded.current) {
      idbSet('projects', projects).catch(() => {});
    }
  }, [projects]);

  const addProject = (project) => {
    const newProject = {
      ...project,
      id: uuidv4(),
      order: projects.length,
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id, updates) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const reorderProjects = (reordered) => {
    setProjects(reordered);
  };

  const getProject = (id) => projects.find((p) => p.id === id);

  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  return (
    <ProjectContext.Provider
      value={{
        projects: sortedProjects,
        addProject,
        updateProject,
        deleteProject,
        reorderProjects,
        getProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
