
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { deleteBusiness } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Business } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BusinessForm } from '@/components/admin/business-form';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MyBusinessesTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const businessesCol = collection(db, 'businesses');
      const q = query(businessesCol, where('ownerId', '==', user.id));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const businessesFromDb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
        businessesFromDb.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setMyBusinesses(businessesFromDb);
        setLoading(false);
      }, (error) => {
        console.error("Failed to subscribe to business updates:", error);
        toast({ title: "Error", description: "Could not fetch your business listings in real-time.", variant: "destructive" });
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, toast]);

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setIsFormOpen(true);
  }
  
  const handleDeleteClick = (business: Business) => {
    setBusinessToDelete(business);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!businessToDelete) return;
    try {
        await deleteBusiness(businessToDelete.id);
        toast({
            title: 'Business Deleted',
            description: `"${businessToDelete.title}" has been permanently deleted.`,
        });
        // The real-time listener will automatically update the UI.
    } catch (error: any) {
        console.error('Failed to delete business:', error);
        toast({
            title: 'Error',
            description: 'Could not delete the business listing.',
            variant: 'destructive',
        });
    } finally {
        setIsDeleteDialogOpen(false);
        setBusinessToDelete(null);
    }
  };
  
  const handleDataChange = () => {
    // The real-time listener handles UI updates automatically.
    if (selectedBusiness?.status === 'approved') {
        toast({
            title: 'Listing Resubmitted',
            description: 'Your changes have been submitted for admin review.',
        });
    } else {
         toast({
            title: 'Listing Updated',
            description: 'Your listing has been updated.',
        });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Businesses</CardTitle>
          <CardDescription>Manage your business listings.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : myBusinesses.length > 0 ? (
            <div className="space-y-4">
              {myBusinesses.map(business => (
                <Card key={business.id} className="flex flex-col md:flex-row items-center p-4 gap-4">
                  <div className="flex-grow">
                    <h3 className="font-semibold">{business.title}</h3>
                    <p className="text-sm text-muted-foreground">{business.category}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {format(business.createdAt.toDate(), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => handleEditBusiness(business)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(business)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
              You have not submitted any business listings yet.
            </div>
          )}
        </CardContent>
      </Card>
      
      <BusinessForm 
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          business={selectedBusiness}
          onDataChange={handleDataChange}
          categories={[]}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the business listing for "{businessToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
