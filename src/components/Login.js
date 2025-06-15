import React, { useState } from 'react';
import './Login.css';
import { loginUser } from '../utils/auth';
import { supabase } from '../utils/supabaseClient';

const Login = ({ onRegisterClick, onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginUser({ email: form.email, password: form.password });
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    } else {
      setError('');
      if (onLoginSuccess) onLoginSuccess(result.user);
    }
  };

  const handleForgotSubmit = async e => {
    e.preventDefault();
    setForgotMsg('');
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: 'http://localhost:3000/reset-password'
    });
    setForgotLoading(false);
    if (error) {
      setForgotMsg(error.message);
    } else {
      setForgotMsg('If this email is registered, a password reset link has been sent.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Sign In</h2>
        {!showForgot ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required disabled={loading} />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 12 }}>
              <button type="button" className="register-button-link" style={{ fontSize: '0.98rem', padding: 0 }} onClick={() => setShowForgot(true)} disabled={loading}>
                Forgot password?
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} style={{ marginTop: 24 }}>
            <div className="form-group">
              <label htmlFor="forgot-email">Enter your email</label>
              <input type="email" id="forgot-email" name="forgotEmail" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required disabled={forgotLoading} />
            </div>
            {forgotMsg && <div className={forgotMsg.startsWith('If this') ? 'success-message' : 'error-message'}>{forgotMsg}</div>}
            <button type="submit" className="login-button" disabled={forgotLoading}>{forgotLoading ? 'Sending...' : 'Send reset link'}</button>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
              <button
                type="button"
                className="register-button-link"
                onClick={() => setShowForgot(false)}
                disabled={forgotLoading}
                style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <span style={{ fontSize: '1.1rem' }}>←</span> Back to login
              </button>
            </div>
          </form>
        )}
        <p className="register-prompt">
          Don't have an account?{' '}
          <button onClick={onRegisterClick} className="register-button-link" disabled={loading}>
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login; 