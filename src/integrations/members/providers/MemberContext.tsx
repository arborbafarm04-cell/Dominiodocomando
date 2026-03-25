import { createContext } from 'react';

export interface Member {
  _id?: string;
  loginEmail?: string;
  loginEmailVerified?: boolean;
  status?: 'UNKNOWN' | 'PENDING' | 'APPROVED' | 'BLOCKED' | 'OFFLINE';
  contact?: {
    firstName?: string;
    lastName?: string;
    phones?: string[];
  };
  profile?: {
    nickname?: string;
    photo?: {
      url?: string;
      height?: number;
      width?: number;
      offsetX?: number;
      offsetY?: number;
    };
    title?: string;
  };
  _createdDate?: Date;
  _updatedDate?: Date;
  lastLoginDate?: Date;
}

export interface MemberContextType {
  member: Member | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  actions: {
    loadCurrentMember: () => Promise<void>;
    login: () => void;
    logout: () => void;
    clearMember: () => void;
  };
}

export const MemberContext = createContext<MemberContextType | undefined>(undefined);
