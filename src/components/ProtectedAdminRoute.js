import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserAdmin } from '../utils/adminPermissions';

const ProtectedAdminRoute = ({ children, userProfile }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!userProfile || !userProfile.id) {
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await isUserAdmin(userProfile.id);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          // Redirect non-admin users to home page
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [userProfile, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        Checking administrator permissions...
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#dc2626'
      }}>
        You must log in to access this page.
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#dc2626',
        textAlign: 'center'
      }}>
        <h3>Access Denied</h3>
        <p>You do not have administrator permissions to access this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute; 