import { supabase } from './supabaseClient';

export const canUserViewReport = async (userId, reportId) => {
  // 1. Obtén los roles del usuario
  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId);

  if (userRolesError || !userRoles || userRoles.length === 0) return false;

  const roleIds = userRoles.map(r => r.role_id);

  // 2. Verifica si alguno de sus roles tiene permiso para ver el reporte
  const { data: permissions, error: permError } = await supabase
    .from('report_permissions')
    .select('can_view')
    .eq('report_id', reportId)
    .in('role_id', roleIds);

  if (permError) return false;
  return permissions.some(p => p.can_view);
}; 