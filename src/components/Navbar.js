import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { isUserAdmin } from '../utils/adminPermissions';

const Navbar = ({ onExpansionChange, userProfile, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleMouseEnter = () => {
    setIsExpanded(true);
    if (onExpansionChange) onExpansionChange(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    if (onExpansionChange) onExpansionChange(false);
  };

  // Check if user is admin when userProfile changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('🔄 Navbar: Checking admin status for user profile:', userProfile);
      
      if (userProfile && userProfile.id) {
        console.log('✅ Navbar: User profile has ID:', userProfile.id);
        const adminStatus = await isUserAdmin(userProfile.id);
        console.log('🎯 Navbar: Admin status result:', adminStatus);
        setIsAdmin(adminStatus);
      } else {
        console.log('❌ Navbar: No user profile or ID found');
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [userProfile]);

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
        {userProfile && (
          <>
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
            {isAdmin && (
              <li className="sidebar-item">
                <Link to="/admin">
                  <span className="sidebar-icon">👨‍💼</span>
                  <span className="sidebar-item-text">Admin Panel</span>
                </Link>
              </li>
            )}
          </>
        )}
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