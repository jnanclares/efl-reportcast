import React, { useEffect, useState } from 'react';
import { canUserViewReport } from '../utils/reportPermissions';
import { supabase } from '../utils/supabaseClient';
import RequestAccessModal from './RequestAccessModal';

const ProtectedReportRoute = ({ reportId, children }) => {
  const [isAllowed, setIsAllowed] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAllowed(false);
        setUserId(null);
        return;
      }
      setUserId(user.id);
      const allowed = await canUserViewReport(user.id, reportId);
      setIsAllowed(allowed);
      // Verificar si ya hay una solicitud pendiente, en revisión o aceptada
      const { data: solicitudes, error } = await supabase
        .from('solicitudes_reportes')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('reporte_id', reportId);
      // El botón solo se deshabilita si hay una solicitud que NO está en 'rejected'
      const hasActiveRequest = (solicitudes || []).some(s => s.status !== 'rejected');
      setHasRequested(hasActiveRequest);
    };
    check();
  }, [reportId, showModal]);

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
        <button className="request-access-btn" onClick={() => setShowModal(true)} disabled={hasRequested}>
          {hasRequested ? 'Request sent' : 'Request access'}
        </button>
        <RequestAccessModal open={showModal} onClose={() => setShowModal(false)} userId={userId} defaultReportId={reportId} />
      </div>
    );
  }

  return children;
};

export default ProtectedReportRoute; 