import { ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';

type UserRole = 'admin' | 'client' | 'wholesale' | 'driver';

interface RoleBasedViewProps {
  children: (role: UserRole) => ReactNode;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
}

export function RoleBasedView({ children, allowedRoles, fallback = null }: RoleBasedViewProps) {
  const { user } = useUser();
  const userRole = user?.role as UserRole;

  // Se não há restrições de papel, renderiza para todos
  if (!allowedRoles) {
    return <>{children(userRole)}</>;
  }

  // Verifica se o usuário tem permissão
  if (allowedRoles.includes(userRole)) {
    return <>{children(userRole)}</>;
  }

  // Retorna o fallback se o usuário não tiver permissão
  return <>{fallback}</>;
}

// Componentes específicos para cada papel
export function AdminOnly({ children }: { children: ReactNode }) {
  return (
    <RoleBasedView allowedRoles={['admin']}>
      {() => children}
    </RoleBasedView>
  );
}

export function ClientOnly({ children }: { children: ReactNode }) {
  return (
    <RoleBasedView allowedRoles={['client']}>
      {() => children}
    </RoleBasedView>
  );
}

export function WholesaleOnly({ children }: { children: ReactNode }) {
  return (
    <RoleBasedView allowedRoles={['wholesale']}>
      {() => children}
    </RoleBasedView>
  );
}

export function DriverOnly({ children }: { children: ReactNode }) {
  return (
    <RoleBasedView allowedRoles={['driver']}>
      {() => children}
    </RoleBasedView>
  );
}
