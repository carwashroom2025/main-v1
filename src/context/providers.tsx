

'use client';

import { type ReactNode, useState, useEffect, useCallback } from 'react';
import { onAuthStateChange } from '@/lib/firebase/auth';
import { toggleFavorite as toggleFavoriteCarInDb, toggleFavoriteBusiness as toggleFavoriteBusinessInDb } from '@/lib/firebase/firestore';
import type { User } from '../lib/types';
import { AuthContext } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleFavoriteCar = useCallback(async (carId: string) => {
    if (!user) return;

    const isCurrentlyFavorite = user.favoriteCars?.includes(carId);
    
    // Optimistically update UI
    setUser(currentUser => {
        if (!currentUser) return null;
        const oldFavorites = currentUser.favoriteCars || [];
        const newFavorites = isCurrentlyFavorite
            ? oldFavorites.filter(id => id !== carId)
            : [...oldFavorites, carId];
        return { ...currentUser, favoriteCars: newFavorites };
    });

    try {
        await toggleFavoriteCarInDb(user.id, carId);
        toast({
            title: isCurrentlyFavorite ? "Removed from Favorites" : "Added to Favorites",
        });
    } catch (error) {
        // Revert UI on error
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, favoriteCars: user.favoriteCars };
        });
        toast({
            title: "Error",
            description: "Could not update favorites. Please try again.",
            variant: "destructive"
        });
        console.error("Failed to toggle favorite:", error);
    }
  }, [user, toast]);
  
  const toggleFavoriteBusiness = useCallback(async (businessId: string) => {
    if (!user) return;

    const isCurrentlyFavorite = user.favoriteBusinesses?.includes(businessId);
    
    const originalFavorites = user.favoriteBusinesses;

    setUser(currentUser => {
        if (!currentUser) return null;
        const oldFavorites = currentUser.favoriteBusinesses || [];
        const newFavorites = isCurrentlyFavorite
            ? oldFavorites.filter(id => id !== businessId)
            : [...oldFavorites, businessId];
        return { ...currentUser, favoriteBusinesses: newFavorites };
    });

    try {
        await toggleFavoriteBusinessInDb(user.id, businessId);
        toast({
            title: isCurrentlyFavorite ? "Removed from Favorites" : "Added to Favorites",
        });
    } catch (error) {
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, favoriteBusinesses: originalFavorites };
        });
        toast({
            title: "Error",
            description: "Could not update favorites. Please try again.",
            variant: "destructive"
        });
        console.error("Failed to toggle favorite business:", error);
    }
  }, [user, toast]);

  return (
      <AuthContext.Provider value={{ user, loading, setUser, toggleFavoriteCar, toggleFavoriteBusiness }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </AuthContext.Provider>
  );
}
