//import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();

  // Verificar se o usuário tem permissão
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            Acesso Negado
          </AlertTitle>
          <AlertDescription className="mt-2">
            Você não tem permissão para acessar esta página. Esta área é
            exclusiva para administradores.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}