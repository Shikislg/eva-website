import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import CategoryPage from './pages/CategoryPage';
import ProjectDetail from './pages/ProjectDetail';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <LanguageProvider>
    <ProjectProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work/:category" element={<CategoryPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ProjectProvider>
    </LanguageProvider>
  );
}

export default App;
