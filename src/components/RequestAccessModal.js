import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const RequestAccessModal = ({ open, onClose, userId, defaultReportId }) => {
  const [reportName, setReportName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGlobalSuccess, setShowGlobalSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Obtener el nombre del reporte por id
    const fetchReportName = async () => {
      if (defaultReportId) {
        const { data, error } = await supabase.from('reports').select('name').eq('id', defaultReportId).single();
        if (data && data.name) setReportName(data.name);
        else setReportName('');
      }
    };
    // Obtener los roles
    const fetchRoles = async () => {
      const { data: rolesData } = await supabase.from('report_roles').select('id, name');
      setRoles(rolesData || []);
    };
    fetchReportName();
    fetchRoles();
  }, [open, defaultReportId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!defaultReportId || !roleId) {
      setError('Please select a role.');
      return;
    }
    setLoading(true);
    console.log({
      user_id: userId,
      reporte_id: defaultReportId,
      report_rol_id: roleId,
      status: 'pending'
    });
    const { error } = await supabase.from('solicitudes_reportes').insert({
      user_id: userId,
      reporte_id: defaultReportId,
      report_rol_id: roleId,
      status: 'pending',
    });
    setLoading(false);
    if (error) {
      setError('Error submitting request.');
    } else {
      setSuccess('Request submitted!');
      setShowGlobalSuccess(true);
      setTimeout(() => {
        setShowGlobalSuccess(false);
        onClose();
      }, 1800);
    }
  };

  if (!open) return null;

  return (
    <>
      {showGlobalSuccess && (
        <div style={{ position: 'fixed', top: 30, left: 0, right: 0, zIndex: 3000, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#4CAF50', color: '#fff', padding: '14px 32px', borderRadius: 8, fontSize: 18, boxShadow: '0 2px 8px #0002' }}>
            Your request has been sent successfully!
          </div>
        </div>
      )}
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: 400 }}>
          <button onClick={onClose} className="modal-close-button">&times;</button>
          <h2>Request Access</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Report</label>
              <div style={{ padding: '8px 0', fontWeight: 'bold' }}>{reportName || 'Loading...'}</div>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={roleId}
                onChange={e => setRoleId(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1.5px solid #3a5ba0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  background: '#f8fafc',
                  color: '#222',
                  marginBottom: 8,
                  boxShadow: '0 1px 4px #0001',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'gray\' height=\'20\' viewBox=\'0 0 20 20\' width=\'20\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7.293 7.293a1 1 0 011.414 0L10 8.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z\'/></svg>")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                <option value="">Select a role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button type="submit" className="register-button" disabled={loading}>{loading ? 'Sending...' : 'Submit Request'}</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RequestAccessModal; 