import React, { useEffect, useState } from 'react';
import { canUserViewReport } from '../utils/reportPermissions';
import { supabase } from '../utils/supabaseClient';

const ProtectedReportRoute = ({ reportId, children }) => {
  const [isAllowed, setIsAllowed] = useState(null);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAllowed(false);
        return;
      }
      const allowed = await canUserViewReport(user.id, reportId);
      setIsAllowed(allowed);
    };
    check();
  }, [reportId]);

  if (isAllowed === null) {
    return (
      <div className="mock-report-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#666' }}>
          <span>Checking permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="mock-report-card">
        <h3>Access Denied</h3>
        <p>You don't have permission to view this report.</p>
        <div style={{ 
          width: '100%', 
          height: 200, 
          marginBottom: 12, 
          background: '#fff3cd', 
          borderRadius: 6, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#856404',
          border: '1px solid #ffeaa7'
        }}>
          <span style={{ fontSize: '2rem', marginBottom: 8 }}>🔒</span>
          <span>Restricted content</span>
        </div>
        <button className="request-access-btn" disabled>
          Request access
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedReportRoute; 