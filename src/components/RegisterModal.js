import React, { useState, useEffect } from 'react';
import './RegisterModal.css';
import { registerUser } from '../utils/auth';

const RegisterModal = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    let timer;
    if (success && !confirmationMessage) {
      timer = setTimeout(() => {
        onClose();
        if (onRegisterSuccess) onRegisterSuccess();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [success, confirmationMessage, onClose, onRegisterSuccess]);

  if (!isOpen) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setConfirmationMessage('');
    if (!form.email.endsWith('@unal.edu.co')) {
      setError('Only corporate emails (@unal.edu.co) are allowed.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await registerUser({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    } else if (result.message) {
      localStorage.setItem('pendingProfile', JSON.stringify({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName
      }));
      setConfirmationMessage(result.message);
      setForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    } else {
      setSuccess('Registration successful. Redirecting to login...');
      setForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-button">&times;</button>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-firstname">First Name</label>
            <input type="text" id="reg-firstname" name="firstName" value={form.firstName} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="reg-lastname">Last Name</label>
            <input type="text" id="reg-lastname" name="lastName" value={form.lastName} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input type="email" id="reg-email" name="email" value={form.email} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="form-group password-group">
            <label htmlFor="reg-password">Password</label>
            <div className="password-input-container">
              <input type={showPassword ? 'text' : 'password'} id="reg-password" name="password" value={form.password} onChange={handleChange} required disabled={loading} />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <div className="form-group password-group">
            <label htmlFor="reg-confirm-password">Confirm Password</label>
            <div className="password-input-container">
              <input type={showPassword ? 'text' : 'password'} id="reg-confirm-password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required disabled={loading} />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          {confirmationMessage && <div className="success-message">{confirmationMessage}</div>}
          <button type="submit" className="register-button" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal; 