

'use client';

import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { User } from '../lib/types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  toggleFavoriteCar: (carId: string) => void;
  toggleFavoriteBusiness: (businessId: string) => void;
}

export const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true, 
    setUser: () => {},
    toggleFavoriteCar: () => {},
    toggleFavoriteBusiness: () => {},
});

export const useAuth = () => useContext(AuthContext);
