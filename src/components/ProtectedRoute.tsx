import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { UserRole } from '@/hooks/useUser';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requireAuth = true
}: ProtectedRouteProps) {
  const { user, loading } = useUser();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não requer autenticação, permite acesso
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Se requer autenticação mas usuário não está logado, redireciona para home
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Se há roles permitidos e o usuário não tem permissão, redireciona baseado no role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirecionar baseado no role do usuário
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'driver':
        return <Navigate to="/driver/dashboard" replace />;
      case 'wholesale':
        return <Navigate to="/catalog" replace />;
      case 'client':
      default:
        return <Navigate to="/catalog" replace />;
    }
  }

  // Acesso permitido
  return <>{children}</>;
}
