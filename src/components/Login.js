import React from 'react';
import './Login.css';

const Login = ({ onRegisterClick }) => {
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar Sesión</h2>
        <form>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="login-button">Ingresar</button>
        </form>
        <p className="register-prompt">
          ¿No tienes una cuenta?{' '}
          <button onClick={onRegisterClick} className="register-button-link">
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login; 