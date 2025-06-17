import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
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

  if (isAllowed === null) return <div>Loading...</div>;
  if (!isAllowed) return <Navigate to='/unauthorized' replace />;
  return children;
};

export default ProtectedReportRoute; 