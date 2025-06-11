import React from 'react';
import './RegisterModal.css';

const RegisterModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button">&times;</button>
        <h2>Registrarse</h2>
        <form>
          <div className="form-group">
            <label htmlFor="reg-username">Nombre de Usuario</label>
            <input type="text" id="reg-username" name="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Correo Electrónico</label>
            <input type="email" id="reg-email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Contraseña</label>
            <input type="password" id="reg-password" name="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-confirm-password">Confirmar Contraseña</label>
            <input type="password" id="reg-confirm-password" name="confirm-password" required />
          </div>
          <button type="submit" className="register-button">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal; 