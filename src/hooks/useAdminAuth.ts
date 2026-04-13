import { useAuth } from "@/components/Auth/AuthProvider";
import { User } from "@/types";

export function useAdminAuth() {
  const { user, loading } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isAuthorized = !loading && isAdmin;

  return {
    user,
    loading,
    isAdmin,
    isAuthorized,
    canAccessAdmin: isAuthorized,
    canManageUsers: isAuthorized,
    canManageSpots: isAuthorized,
    canManageRequests: isAuthorized,
    canManageSystem: isAuthorized,
  };
}

export function requireAdminAuth() {
  const { isAuthorized, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return { authorized: false, loading: true, reason: 'Loading...' };
  }

  if (!isAdmin) {
    return { 
      authorized: false, 
      loading: false, 
      reason: 'Admin access required' 
    };
  }

  return { authorized: true, loading: false, reason: null };
}

export function useAdminPermissions() {
  const { isAuthorized } = useAdminAuth();

  return {
    canViewAdminDashboard: isAuthorized,
    canManageUsers: isAuthorized,
    canCreateUsers: isAuthorized,
    canEditUsers: isAuthorized,
    canDeleteUsers: isAuthorized,
    canManageSpots: isAuthorized,
    canCreateSpots: isAuthorized,
    canEditSpots: isAuthorized,
    canDeleteSpots: isAuthorized,
    canManageRequests: isAuthorized,
    canApproveRequests: isAuthorized,
    canRejectRequests: isAuthorized,
    canDeleteRequests: isAuthorized,
    canViewAnalytics: isAuthorized,
    canManageSystem: isAuthorized,
    canAccessSettings: isAuthorized,
  };
}
