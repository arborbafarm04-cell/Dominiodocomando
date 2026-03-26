import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerAuth } from '@/hooks/usePlayerAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedGameRouteProps {
  children: React.ReactNode;
}

/**
 * Component to protect game routes
 * Redirects to home if player is not authenticated
 */
export default function ProtectedGameRoute({ children }: ProtectedGameRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = usePlayerAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
