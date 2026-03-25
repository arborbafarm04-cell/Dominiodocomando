import { ReactNode, useState, useEffect } from 'react';
import { MemberContext, Member } from '@/integrations/members/providers/MemberContext';

export function MemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load member from localStorage on mount
    const loadMember = async () => {
      try {
        const storedMember = localStorage.getItem('wix_member');
        if (storedMember) {
          const parsedMember = JSON.parse(storedMember);
          setMember(parsedMember);
          setIsAuthenticated(!!parsedMember._id);
        }
      } catch (error) {
        console.error('Failed to load member:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMember();
  }, []);

  const actions = {
    loadCurrentMember: async () => {
      setIsLoading(true);
      try {
        const storedMember = localStorage.getItem('wix_member');
        if (storedMember) {
          const parsedMember = JSON.parse(storedMember);
          setMember(parsedMember);
          setIsAuthenticated(!!parsedMember._id);
        }
      } catch (error) {
        console.error('Failed to load member:', error);
      } finally {
        setIsLoading(false);
      }
    },
    login: () => {
      // Redirect to login API
      window.location.href = '/api/auth/login';
    },
    logout: () => {
      // Clear member and redirect to logout API
      setMember(null);
      setIsAuthenticated(false);
      localStorage.removeItem('wix_member');
      window.location.href = '/api/auth/logout';
    },
    clearMember: () => {
      setMember(null);
      setIsAuthenticated(false);
      localStorage.removeItem('wix_member');
    },
  };

  return (
    <MemberContext.Provider
      value={{
        member,
        isAuthenticated,
        isLoading,
        actions,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}
