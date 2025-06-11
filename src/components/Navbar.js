import React, { useState } from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = ({ onExpansionChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseEnter = () => {
    setIsExpanded(true);
    if (onExpansionChange) onExpansionChange(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    if (onExpansionChange) onExpansionChange(false);
  };

  return (
    <nav 
      className={`navbar-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-header">
        <img src={logo} alt="EFL Logo" className="sidebar-logo" />
        <span className="sidebar-title">ReportCast</span>
      </div>
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <a href="#seccion1">
            <span className="sidebar-icon">📄</span>
            <span className="sidebar-item-text">Sección 1</span>
          </a>
        </li>
        <li className="sidebar-item">
          <a href="#seccion2">
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-item-text">Sección 2</span>
          </a>
        </li>
        <li className="sidebar-item">
          <a href="#seccion3">
            <span className="sidebar-icon">⚙️</span>
            <span className="sidebar-item-text">Sección 3</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 