import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

function getTokenFromHashOrQuery(searchParams) {
  // Primero intenta query param
  const queryToken = searchParams.get('access_token');
  if (queryToken) return queryToken;
  // Luego intenta hash
  if (window.location.hash) {
    const hash = window.location.hash.substring(1); // quita el '#'
    const params = new URLSearchParams(hash);
    return params.get('access_token');
  }
  return null;
}

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkedToken, setCheckedToken] = useState(false);
  const accessToken = getTokenFromHashOrQuery(searchParams);

  useEffect(() => {
    // Espera un ciclo para asegurar que el hash esté disponible
    const timer = setTimeout(() => {
      setCheckedToken(true);
      if (!getTokenFromHashOrQuery(searchParams)) {
        setError('Invalid or missing reset token.');
      }
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    // Set the access token in Supabase client
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: accessToken });
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password updated! You can now log in with your new password.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Reset Password</h2>
        {checkedToken && error && <div className="error-message">{error}</div>}
        {success ? (
          <>
            <div className="success-message">{success}</div>
            <button className="login-button" onClick={() => navigate('/')}>Go to Login</button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>{loading ? 'Saving...' : 'Reset Password'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 