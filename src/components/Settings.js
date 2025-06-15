import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../utils/auth';
import { supabase } from '../utils/supabaseClient';
import './Settings.css';

const Settings = ({ userProfile }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    if (userProfile) {
      setForm({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || '',
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const ok = await updateUserProfile(userProfile.id, form.firstName, form.lastName);
    setLoading(false);
    if (ok) {
      setSuccess('Profile updated successfully!');
    } else {
      setError('Could not update profile. Please try again.');
    }
  };

  // Password change handlers
  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPassword });
    setPwLoading(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwSuccess('Password updated! Please check your email to confirm the change.');
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    }
  };

  return (
    <div className="settings-root">
      <div className="settings-title">Account Settings</div>
      <div className="settings-main-card">
        <div className="settings-section-card">
          <div className="settings-section">
            <h2>Profile</h2>
            <div className="section-desc">Update your name and view your email address associated with your account.</div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="settings-firstname">First Name</label>
                <input
                  type="text"
                  id="settings-firstname"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="settings-lastname">Last Name</label>
                <input
                  type="text"
                  id="settings-lastname"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="settings-email">Email</label>
                <input
                  type="email"
                  id="settings-email"
                  name="email"
                  value={form.email}
                  readOnly
                  disabled
                />
              </div>
              {error && <div className="settings-error">{error}</div>}
              {success && <div className="settings-success">{success}</div>}
              <div className="settings-actions">
                <button type="submit" className="settings-button" disabled={loading}>
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="settings-section-card">
          <div className="settings-section">
            <h2>Change Password</h2>
            <div className="section-desc">Set a new password for your account. You will receive a confirmation email after changing your password.</div>
            <form onSubmit={handlePwSave}>
              <div className="form-group">
                <label htmlFor="pw-current">Current Password</label>
                <input
                  type="password"
                  id="pw-current"
                  name="currentPassword"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  disabled={pwLoading}
                  autoComplete="current-password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pw-new">New Password</label>
                <input
                  type="password"
                  id="pw-new"
                  name="newPassword"
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  disabled={pwLoading}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pw-confirm">Confirm New Password</label>
                <input
                  type="password"
                  id="pw-confirm"
                  name="confirmNewPassword"
                  value={pwForm.confirmNewPassword}
                  onChange={handlePwChange}
                  disabled={pwLoading}
                  autoComplete="new-password"
                />
              </div>
              {pwError && <div className="settings-error">{pwError}</div>}
              {pwSuccess && <div className="settings-success">{pwSuccess}</div>}
              <div className="settings-actions">
                <button type="submit" className="settings-button" disabled={pwLoading}>
                  {pwLoading ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 