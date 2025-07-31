// src/components/Navbar.jsx
import { useState } from 'react';
import '../styles/Navbar.css';
import Sidebar from './Sidebar';
import logo from '../assets/logo.png';

function Navbar({ setContent }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left" onClick={() => setSidebarOpen(true)} style={{ cursor: 'pointer' }}>
          <img src={logo} style={{ width: '80px' }} alt="logo" />
          <span className="navbar-title">InvenTech</span>
        </div>
        <div className="navbar-buttons">
          <button className="nav-btn btn-1" onClick={() => setContent('dashboard')}>EM DEV</button>
          <button className="nav-btn btn-2" onClick={() => setContent('calendario')}>EM DEV</button>
          <button className="nav-btn btn-3" onClick={() => setContent('chamados')}>EM DEV</button>
        </div>
      </nav>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} setContent={setContent} />
    </>
  );
}

export default Navbar;