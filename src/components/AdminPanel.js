import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { supabase } from '../utils/supabaseClient';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); // Single role instead of array
  const [saving, setSaving] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [roleColumnName, setRoleColumnName] = useState('roleid'); // Track which column name to use
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'requests'

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

  // Fetch all pending requests with complete information
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      // 1. Get all pending requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('solicitudes_reportes')
        .select('id, status, user_id, reporte_id, report_rol_id')
        .eq('status', 'pending')
        .order('id', { ascending: false });

      if (requestsError) throw requestsError;

      if (!requestsData || requestsData.length === 0) {
        setRequests([]);
        return;
      }

      // 2. Get unique user IDs, report IDs, and role IDs
      const userIds = [...new Set(requestsData.map(req => req.user_id))];
      const reportIds = [...new Set(requestsData.map(req => req.reporte_id))];
      const roleIds = [...new Set(requestsData.map(req => req.report_rol_id))];

      // 3. Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.warn('⚠️ Error fetching profiles:', profilesError);
      }

      // 4. Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('id, name')
        .in('id', reportIds);

      if (reportsError) {
        console.warn('⚠️ Error fetching reports:', reportsError);
      }

      // 5. Fetch report roles
      const { data: reportRolesData, error: reportRolesError } = await supabase
        .from('report_roles')
        .select('id, name')
        .in('id', roleIds);

      if (reportRolesError) {
        console.warn('⚠️ Error fetching report roles:', reportRolesError);
      }

      // 6. Combine the data
      const enrichedRequests = requestsData.map(request => {
        const profile = profilesData?.find(p => p.id === request.user_id);
        const report = reportsData?.find(r => r.id === request.reporte_id);
        const reportRole = reportRolesData?.find(rr => rr.id === request.report_rol_id);

        return {
          ...request,
          profiles: profile || null,
          reports: report || null,
          report_roles: reportRole || null
        };
      });

      console.log('📋 Fetched and enriched requests:', enrichedRequests);
      setRequests(enrichedRequests);
      
    } catch (err) {
      console.error('❌ Error fetching requests:', err);
      setError('Error loading requests: ' + err.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Approve a request
  const approveRequest = async (requestId, userId, reportId, reportRoleId) => {
    setProcessingRequest(requestId);
    try {
      // 1. Update request status to approved
      const { error: updateError } = await supabase
        .from('solicitudes_reportes')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // 2. Get the report role details
      const { data: reportRole, error: reportRoleError } = await supabase
        .from('report_roles')
        .select('id, name, description')
        .eq('id', reportRoleId)
        .single();

      if (reportRoleError) {
        throw new Error('Could not find the requested report role');
      }

      // 3. Check if a system role with the same name already exists
      const { data: existingRoles, error: existingRolesError } = await supabase
        .from('roles')
        .select('id, name')
        .eq('name', reportRole.name);

      if (existingRolesError) {
        throw existingRolesError;
      }

      let systemRoleId;

      if (existingRoles && existingRoles.length > 0) {
        // Use existing system role
        systemRoleId = existingRoles[0].id;
        console.log('✅ Using existing system role:', existingRoles[0].name);
      } else {
        // Create new system role automatically
        const { data: newRole, error: createRoleError } = await supabase
          .from('roles')
          .insert({
            name: reportRole.name,
            description: reportRole.description || `Auto-created role for report access: ${reportRole.name}`
          })
          .select('id')
          .single();

        if (createRoleError) {
          throw createRoleError;
        }

        systemRoleId = newRole.id;
        console.log('✅ Created new system role:', reportRole.name);
      }

      // 4. Create permission in report_permissions table
      const { error: permissionError } = await supabase
        .from('report_permissions')
        .insert({
          report_id: reportId,
          role_id: systemRoleId,
          can_view: true,
          can_edit: false
        });

      if (permissionError) {
        // If permission already exists, ignore the error
        if (!permissionError.message.includes('duplicate') && !permissionError.message.includes('unique')) {
          throw permissionError;
        }
      }

      // 5. Assign the system role to the user
      const { error: userRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: systemRoleId
        });

      if (userRoleError) {
        // If user role already exists, ignore the error
        if (!userRoleError.message.includes('duplicate') && !userRoleError.message.includes('unique')) {
          console.warn('⚠️ User role assignment error:', userRoleError);
        }
      }

      // Refresh requests
      await fetchRequests();
      console.log('✅ Request approved and permissions granted successfully');

    } catch (err) {
      console.error('❌ Error approving request:', err);
      setError('Error approving request: ' + err.message);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Reject a request
  const rejectRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const { error } = await supabase
        .from('solicitudes_reportes')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh requests
      await fetchRequests();
      console.log('✅ Request rejected successfully');

    } catch (err) {
      console.error('❌ Error rejecting request:', err);
      setError('Error rejecting request: ' + err.message);
    } finally {
      setProcessingRequest(null);
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
    fetchRequests();
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
      
      {/* Statistics */}
      <div className="admin-stats">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{roles.length}</h3>
          <p>Available Roles</p>
        </div>
        <div className="stat-card">
          <h3>{requests.length}</h3>
          <p>Pending Requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users & Roles
        </button>
        <button 
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📋 Access Requests
          {requests.length > 0 && <span className="badge">{requests.length}</span>}
        </button>
      </div>

      {/* Users Section */}
      {activeTab === 'users' && (
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

          {users.length === 0 && (
            <div className="no-users">
              <p>No users found in the database.</p>
            </div>
          )}
        </div>
      )}

      {/* Requests Section */}
      {activeTab === 'requests' && (
        <div className="requests-section">
          <div className="section-header">
            <h3>Pending Access Requests</h3>
            <button 
              onClick={fetchRequests}
              className="refresh-button"
              disabled={requestsLoading}
            >
              🔄 {requestsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {requestsLoading ? (
            <div className="loading-message">
              <p>Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="no-requests">
              <p>No pending requests found.</p>
            </div>
          ) : (
            <div className="requests-table-container">
              <table className="requests-table">
                                  <thead>
                  <tr>
                    <th>User</th>
                    <th>Report</th>
                    <th>Role Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id}>
                      <td>
                        <div className="request-user">
                          <div className="user-name">
                            {request.profiles?.first_name && request.profiles?.last_name
                              ? `${request.profiles.first_name} ${request.profiles.last_name}`
                              : 'Unknown User'
                            }
                          </div>
                          <div className="user-email">{request.profiles?.email || 'No email'}</div>
                        </div>
                      </td>
                      <td>
                        <span className="report-name">
                          {request.reports?.name || 'Unknown Report'}
                        </span>
                      </td>
                      <td>
                        <span className="role-badge">
                          {request.report_roles?.name || 'Unknown Role'}
                        </span>
                      </td>
                      <td>
                        <div className="request-actions">
                          <button
                            onClick={() => approveRequest(
                              request.id,
                              request.user_id,
                              request.reporte_id,
                              request.report_rol_id
                            )}
                            className="approve-button"
                            disabled={processingRequest === request.id}
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => rejectRequest(request.id)}
                            className="reject-button"
                            disabled={processingRequest === request.id}
                          >
                            ❌ Reject
                          </button>
                        </div>
                        {processingRequest === request.id && (
                          <div className="processing-indicator">
                            Processing...
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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