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

// Componente de ejemplo para mostrar cómo se integraría Power BI
function PowerBIReport({ name, description, embedUrl, accessToken }) {
  return (
    <div className="mock-report-card">
      <h3>{name}</h3>
      <p>{description}</p>
      {/* Aquí iría el embed real de Power BI usando el SDK, por ahora solo mostramos el iframe de ejemplo */}
      <div style={{width: '100%', height: 300, marginBottom: 12, background: '#eee', borderRadius: 6, overflow: 'hidden'}}>
        <iframe
          title={name}
          src={embedUrl + '&embedToken=' + accessToken}
          style={{width: '100%', height: '100%', border: 'none'}}
          allowFullScreen
        />
      </div>
      <button className="request-access-btn" disabled>
        Pedir acceso
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
      {error && <p style={{color: 'red'}}>{error}</p>}
      <div className="mock-reports-grid">
        {reports.map((report) => (
          <PowerBIReport key={report.id} {...report} />
        ))}
      </div>
      <p style={{marginTop: 32, color: '#888', fontSize: 15}}>
        (Reportes disponibles actualmente a los cuales se puede pedir acceso.)
      </p>
    </div>
  );
}

function DocumentationPage() {
  return <div className="homepage-container"><h2>Documentation</h2><p>Coming soon...</p></div>;
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
