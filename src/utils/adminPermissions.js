import { supabase } from './supabaseClient';

// Check if a user has admin role
export const isUserAdmin = async (userId) => {
  try {
    console.log('🔍 Checking admin permissions for user:', userId);
    
    // Get user roles - try both possible column names
    let { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('roleid')
      .eq('user_id', userId);
    
    // If that fails, try with role_id instead
    if (userRolesError && userRolesError.message.includes('column')) {
      console.log('🔄 Trying with role_id column name instead...');
      const result = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId);
      
      userRoles = result.data?.map(r => ({ roleid: r.role_id }));
      userRolesError = result.error;
    }

    console.log('📊 User roles query result:', { userRoles, userRolesError });

    if (userRolesError || !userRoles || userRoles.length === 0) {
      console.log('❌ No roles found for user or error occurred');
      return false;
    }

    // Get role names to check if any is admin
    const roleIds = userRoles.map(r => r.roleid);
    console.log('🎭 Role IDs found:', roleIds);
    
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name')
      .in('id', roleIds);

    console.log('🏷️ Roles query result:', { roles, rolesError });

    if (rolesError) {
      console.log('⚠️ Roles table error, falling back to role ID check');
      // If roles table doesn't exist, check for admin role_id
      // You can customize this logic based on your role system
      // For now, let's assume role_id 1 is admin
      return roleIds.includes(1);
    }

    // Check if any role is 'admin' (case insensitive)
    const isAdmin = roles.some(role => 
      role.name && role.name.toLowerCase().includes('admin')
    );
    
    console.log('👨‍💼 Is user admin?', isAdmin);
    console.log('🔍 Role names found:', roles.map(r => r.name));
    
    return isAdmin;
  } catch (error) {
    console.error('❌ Error checking admin permissions:', error);
    return false;
  }
};

// Get user role names
export const getUserRoles = async (userId) => {
  try {
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('roleid')
      .eq('user_id', userId);

    if (userRolesError || !userRoles || userRoles.length === 0) {
      return [];
    }

    const roleIds = userRoles.map(r => r.roleid);
    
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name')
      .in('id', roleIds);

    if (rolesError) {
      // Return role IDs as strings if roles table doesn't exist
      return roleIds.map(id => `Role ${id}`);
    }

    return roles.map(role => role.name);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}; 