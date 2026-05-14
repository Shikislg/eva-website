import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ProjectContext = createContext();

const STORAGE_KEY = 'eva_portfolio_projects';
const STORAGE_VERSION_KEY = 'eva_portfolio_version';
const CURRENT_VERSION = '2';

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

function loadProjects() {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
      return defaultProjects;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fall through to defaults
  }
  return defaultProjects;
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(loadProjects);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
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
