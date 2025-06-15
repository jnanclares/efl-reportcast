import React, { useState } from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

const Navbar = ({ onExpansionChange, userProfile, onLogout }) => {
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
        <Link to="/" className="sidebar-title sidebar-title-link"><strong>ReportCast</strong></Link>
      </div>
      {userProfile && isExpanded && (
        <div className="user-profile">
          <h3>{userProfile.first_name} {userProfile.last_name}</h3>
          <p>{userProfile.email}</p>
        </div>
      )}
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <Link to="/documentation">
            <span className="sidebar-icon">📄</span>
            <span className="sidebar-item-text">Documentation</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/reports">
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-item-text">Reports</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/settings">
            <span className="sidebar-icon">⚙️</span>
            <span className="sidebar-item-text">Settings</span>
          </Link>
        </li>
      </ul>
      {userProfile && isExpanded && (
        <div className="sidebar-logout">
          <button onClick={onLogout}>Log out</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 