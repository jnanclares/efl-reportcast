import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Login from './components/Login';
import RegisterModal from './components/RegisterModal';
import Settings from './components/Settings';
import { supabase } from './utils/supabaseClient';
import { getUserProfile, updateUserProfile } from './utils/auth';
import logo from './assets/logo.png';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ResetPassword from './components/ResetPassword';
import ProtectedReportRoute from './components/ProtectedReportRoute';

// Logo de Power BI para la vista previa
const powerBILogo = 'https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg';

// Componente de ejemplo para mostrar cómo se integraría Power BI
function PowerBIReport({ id, name, description, embedUrl, accessToken }) {
  const [showReport, setShowReport] = useState(false);

  const handleViewReport = () => {
    setShowReport(true);
  };

  if (showReport) {
    return (
      <ProtectedReportRoute reportId={id}>
        <div className="mock-report-card">
          <h3>{name}</h3>
          <p>{description}</p>
          {/* Iframe real de Power BI para reportes públicos */}
          <div style={{ width: '100%', height: 400, marginBottom: 12, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
            <iframe
              title={name}
              src={embedUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              frameBorder="0"
            />
          </div>
          <button onClick={() => setShowReport(false)} className="request-access-btn">
            Cerrar reporte
          </button>
        </div>
      </ProtectedReportRoute>
    );
  }

  return (
    <div className="mock-report-card">
      <h3>{name}</h3>
      <p>{description}</p>
      {/* Logo de Power BI como vista previa */}
      <div style={{ width: '100%', height: 200, marginBottom: 12, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={powerBILogo} alt="Power BI Logo" style={{ maxHeight: 90, maxWidth: '80%' }} />
      </div>
      <button onClick={handleViewReport} className="request-access-btn">
        Ver reporte
      </button>
    </div>
  );
}

function HomePage() {
  return (
    <div className="homepage-container">
      <img src={logo} alt="EFL Logo" className="homepage-logo" />
      <h2>Welcome to EFL Global</h2>
      <h3>Business Intelligence Reporting Platform</h3>
      <p style={{ marginTop: 24, fontSize: 16 }}>
        This platform allows you to access, visualize, and analyze your business data through interactive dashboards and reports.<br />
        <br />
        <strong>How to access your reports:</strong><br />
        To view your dashboards, click on the <b>📊 Reports</b> menu item on the left sidebar. Use the <b>📄 Documentation</b> section for help and the <b>⚙️ Settings</b> section to manage your preferences.
      </p>
    </div>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('reports').select('*');
      if (error) {
        setError('Error al cargar los reportes');
        setReports([]);
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <div className="reports-list-mock">
      <h2>Reportes disponibles</h2>
      {loading && <p>Cargando reportes...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="mock-reports-grid">
        {reports.map((report) => (
          <PowerBIReport key={report.id} {...report} />
        ))}
      </div>
      <p style={{ marginTop: 32, color: '#888', fontSize: 15 }}>
        (Haz clic en "Ver reporte" para acceder a cada reporte individual)
      </p>
    </div>
  );
}

function DocumentationPage() {
  return (
    <div className="homepage-container">
      <h2>Documentation</h2>
      <p>Coming soon...</p>
    </div>
  );
}

function AppContent() {
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isResetPassword = location.pathname.startsWith('/reset-password');

  useEffect(() => {
    // Persistent session recovery
    const getSessionAndProfile = async () => {
      const { data, error } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user || null;
      setUser(sessionUser);
      if (sessionUser) {
        const profile = await getUserProfile(sessionUser.id);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    };
    getSessionAndProfile();
    // Listen for session changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      setUser(sessionUser);
      if (sessionUser) {
        getUserProfile(sessionUser.id).then(setUserProfile);
      } else {
        setUserProfile(null);
      }
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleOpenRegisterModal = () => {
    setRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false);
  };

  const handleRegisterSuccess = () => {
    setRegisterModalOpen(false);
  };

  const handleLoginSuccess = async (user) => {
    setUser(user);
    let profile = await getUserProfile(user.id);
    // Check for pending profile in localStorage
    const pendingProfile = JSON.parse(localStorage.getItem('pendingProfile') || 'null');
    if (
      profile &&
      (!profile.first_name || !profile.last_name) &&
      pendingProfile &&
      pendingProfile.email === user.email
    ) {
      // Update profile in Supabase
      await updateUserProfile(user.id, pendingProfile.firstName, pendingProfile.lastName);
      // Remove from localStorage
      localStorage.removeItem('pendingProfile');
      // Fetch updated profile
      profile = await getUserProfile(user.id);
    }
    setUserProfile(profile);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    navigate('/');
  };

  return (
    <div className={`App ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {!isResetPassword && (
        <Navbar onExpansionChange={setSidebarExpanded} userProfile={userProfile} onLogout={handleLogout} />
      )}
      <main className="App-main">
        <Routes>
          <Route path="/" element={!user ? <Login onRegisterClick={handleOpenRegisterModal} onLoginSuccess={handleLoginSuccess} /> : <HomePage />} />
          <Route path="/settings" element={<Settings userProfile={userProfile} />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {!isResetPassword && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={handleCloseRegisterModal}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
