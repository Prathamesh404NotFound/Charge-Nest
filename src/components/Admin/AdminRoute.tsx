import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requireAdmin = true 
}) => {
  const { user, loading, isAuthorized, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4 space-y-6">
          <div className="text-center space-y-2">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground">
              You need to be logged in to access this area.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link to="/login?redirect=${encodeURIComponent(location.pathname)}">
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4 space-y-6">
          <div className="text-center space-y-2">
            <Shield className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>
              This area is restricted to administrators only. If you believe this is an error, 
              please contact the system administrator.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                Return to Home
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
