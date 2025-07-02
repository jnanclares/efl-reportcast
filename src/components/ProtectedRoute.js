import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user, userProfile }) => {
  const navigate = useNavigate();

  if (!user || !userProfile) {
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
        <p>You must be logged in to access this page.</p>
        <button 
          onClick={() => navigate('/')}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute; 