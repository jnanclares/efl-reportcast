import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { supabase } from '../utils/supabaseClient';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); // Single role instead of array
  const [saving, setSaving] = useState(false);
  const [roleColumnName, setRoleColumnName] = useState('roleid'); // Track which column name to use
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');

  // Fetch all users with their roles
  const fetchUsersWithRoles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all users from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email');

      if (profilesError) throw profilesError;

      // Fetch all roles (assuming you have a roles table)
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('id, name');

      if (rolesError) {
        // If roles table doesn't exist, set empty array
        console.warn('Roles table not found, using empty roles');
        setRoles([]);
      } else {
        setRoles(rolesData || []);
      }

      // Fetch user roles relationships - try both column names
      let { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, roleid');

      // If roleid doesn't work, try role_id
      if (userRolesError && userRolesError.message?.includes('column')) {
        console.log('🔄 Trying role_id column instead of roleid...');
        setRoleColumnName('role_id'); // Update column name for later use
        const result = await supabase
          .from('user_roles')
          .select('user_id, role_id');
        
        userRolesData = result.data?.map(ur => ({
          user_id: ur.user_id,
          roleid: ur.role_id
        }));
        userRolesError = result.error;
      } else {
        setRoleColumnName('roleid'); // Confirm roleid works
      }

      if (userRolesError) {
        console.error('❌ Error fetching user roles:', userRolesError);
        throw userRolesError;
      }

      console.log('📊 User roles data:', userRolesData);
      console.log('🏷️ Available roles:', rolesData);

      // Combine the data
      const usersWithRoles = profilesData.map(user => {
        const userRoleIds = userRolesData
          .filter(ur => ur.user_id === user.id)
          .map(ur => ur.roleid);
        
        console.log(`👤 User ${user.email} has role IDs:`, userRoleIds);
        
        const userRoleNames = userRoleIds
          .map(roleId => {
            const role = rolesData?.find(r => r.id === roleId);
            console.log(`🔍 Looking for role ID ${roleId}, found:`, role);
            return role ? role.name : `Role ${roleId}`;
          })
          .filter(roleName => roleName && roleName !== 'undefined');

        console.log(`✅ User ${user.email} final roles:`, userRoleNames);

        return {
          ...user,
          roleIds: userRoleIds,
          roles: userRoleNames
        };
      });

      setUsers(usersWithRoles);
    } catch (err) {
      setError('Error loading users: ' + err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save user profile and role
  const saveUserChanges = async (userId, newRoleId, firstName, lastName) => {
    setSaving(true);
    try {
      // Update user profile (name and last name)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim()
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // First, delete existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then, insert the single new role (if selected)
      if (newRoleId) {
        const roleData = { user_id: userId };
        roleData[roleColumnName] = newRoleId;

        console.log('💾 Inserting single role with column name:', roleColumnName, roleData);

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert([roleData]);

        if (insertError) throw insertError;
      }

      // Refresh the users list
      await fetchUsersWithRoles();
      
      // Close modal
      setEditModalOpen(false);
      setEditingUser(null);
      setSelectedRole(null);
      setEditedFirstName('');
      setEditedLastName('');

      console.log('✅ User profile and role updated successfully');

    } catch (err) {
      setError('Error updating user: ' + err.message);
      console.error('❌ Error saving user changes:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle edit button click
  const handleEditUser = (user) => {
    setEditingUser(user);
    // Set the first role ID if user has roles, otherwise null
    setSelectedRole(user.roleIds && user.roleIds.length > 0 ? user.roleIds[0] : null);
    setEditedFirstName(user.first_name || '');
    setEditedLastName(user.last_name || '');
    setEditModalOpen(true);
  };

  // Handle role radio button change
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  // Handle clear role selection
  const handleClearRole = () => {
    setSelectedRole(null);
  };

  // Handle save changes
  const handleSaveChanges = () => {
    if (editingUser) {
      saveUserChanges(editingUser.id, selectedRole, editedFirstName, editedLastName);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setEditingUser(null);
    setSelectedRole(null);
    setEditedFirstName('');
    setEditedLastName('');
  };

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel">
        <h2>Administration Panel</h2>
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <h2>Administration Panel</h2>
        <div className="error">{error}</div>
        <button onClick={fetchUsersWithRoles} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>Administration Panel</h2>
      <div className="admin-stats">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{roles.length}</h3>
          <p>Available Roles</p>
        </div>
      </div>
      
      <div className="users-section">
        <h3>Users and Roles</h3>
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-name">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : 'No name'
                      }
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className="role-display">
                      {user.roles.length > 0 ? (
                        <span className="role-badge">
                          {user.roles[0]}
                        </span>
                      ) : (
                        <span className="no-roles">No role assigned</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="edit-button"
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="no-users">
          <p>No users found in the database.</p>
        </div>
      )}

      {/* Edit Roles Modal */}
      {editModalOpen && editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User - {editingUser.first_name} {editingUser.last_name}</h3>
              <button onClick={handleCancelEdit} className="close-button">×</button>
            </div>
            
            <div className="modal-body">
              <p className="user-info">
                <strong>Email:</strong> {editingUser.email}
              </p>
              
              <div className="profile-section">
                <h4>Personal Information:</h4>
                <div className="form-fields">
                  <div className="field-group">
                    <label htmlFor="firstName" className="field-label">First Name:</label>
                    <input
                      id="firstName"
                      type="text"
                      value={editedFirstName}
                      onChange={(e) => setEditedFirstName(e.target.value)}
                      className="form-input"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="lastName" className="field-label">Last Name:</label>
                    <input
                      id="lastName"
                      type="text"
                      value={editedLastName}
                      onChange={(e) => setEditedLastName(e.target.value)}
                      className="form-input"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </div>
              
              <div className="roles-selection">
                <h4>Select Role:</h4>
                {roles.length > 0 ? (
                  <div className="roles-radio-group">
                    <label className="role-radio">
                      <input
                        type="radio"
                        name="userRole"
                        checked={selectedRole === null}
                        onChange={handleClearRole}
                      />
                      <span className="radio-mark"></span>
                      <span className="role-name no-role">No role assigned</span>
                    </label>
                    {roles.map(role => (
                      <label key={role.id} className="role-radio">
                        <input
                          type="radio"
                          name="userRole"
                          checked={selectedRole === role.id}
                          onChange={() => handleRoleSelect(role.id)}
                        />
                        <span className="radio-mark"></span>
                        <span className="role-name">{role.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="no-roles-available">No roles available</p>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={handleCancelEdit} 
                className="cancel-button"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges} 
                className="save-button"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 