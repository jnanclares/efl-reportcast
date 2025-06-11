import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Login from './components/Login';
import RegisterModal from './components/RegisterModal';

function App() {
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  const handleOpenRegisterModal = () => {
    setRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false);
  };

  return (
    <div className={`App ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <Navbar onExpansionChange={setSidebarExpanded} />
      <main className="App-main">
        <Login onRegisterClick={handleOpenRegisterModal} />
      </main>
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={handleCloseRegisterModal} 
      />
    </div>
  );
}

export default App;
