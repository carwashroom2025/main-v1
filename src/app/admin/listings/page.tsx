
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getPendingBusinesses, updateBusiness, logActivity, getUserById, updateUser } from '@/lib/firebase/firestore';
import type { Business } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Image from 'next/image';
import { ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
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

export default function ApproveListingsPage() {
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const fetchPendingBusinesses = async () => {
    setLoading(true);
    try {
      const businesses = await getPendingBusinesses();
      setPendingBusinesses(businesses);
    } catch (error) {
      console.error("Failed to fetch pending businesses:", error);
      toast({
        title: "Error",
        description: "Could not fetch pending businesses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBusinesses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActionClick = (business: Business, type: 'approve' | 'reject') => {
    setSelectedBusiness(business);
    setAction(type);
  };
  
  const handleConfirmAction = async () => {
    if (!user || !selectedBusiness || !action) return;

    try {
        if (action === 'approve') {
            await updateBusiness(selectedBusiness.id, { status: 'approved', verified: true });
            
            // Check owner role and update if necessary
            if (selectedBusiness.ownerId) {
                const owner = await getUserById(selectedBusiness.ownerId);
                if (owner && owner.role === 'User') {
                    await updateUser(selectedBusiness.ownerId, { role: 'Business Owner' });
                    toast({
                        title: 'User Role Updated',
                        description: `"${owner.name}" has been promoted to Business Owner.`,
                    });
                }
            }

            await logActivity(`Admin "${user.name}" approved business listing: "${selectedBusiness.title}".`, 'listing', selectedBusiness.id, user.id);
            toast({
                title: "Business Approved",
                description: `"${selectedBusiness.title}" has been verified and is now public.`,
            });
        } else if (action === 'reject') {
            await updateBusiness(selectedBusiness.id, { status: 'rejected', verified: false });
            await logActivity(`Admin "${user.name}" rejected business listing: "${selectedBusiness.title}".`, 'listing', selectedBusiness.id, user.id);
            toast({
                title: "Business Rejected",
                description: `"${selectedBusiness.title}" has been rejected and will not be public.`,
                 variant: "destructive",
            });
        }
        
        fetchPendingBusinesses();
    } catch (error: any) {
        console.error(`Failed to ${action} business:`, error);
        toast({
            title: "Error",
            description: `Failed to ${action} the business.`,
            variant: "destructive",
        });
    } finally {
        setSelectedBusiness(null);
        setAction(null);
    }
  }
  
  const getStatusVariant = (status: Business['status']) => {
    switch (status) {
        case 'approved': return 'default';
        case 'pending': return 'secondary';
        case 'edit-pending': return 'outline';
        case 'rejected': return 'destructive';
        default: return 'secondary';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approve Listings</CardTitle>
        <CardDescription>
          Review and approve new or edited business listings submitted by Members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : pendingBusinesses.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            There are no pending listings to review.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingBusinesses.map((business) => (
              <Card key={business.id} className="flex flex-col md:flex-row items-start p-4 gap-4">
                 <div className="relative w-full md:w-32 h-32 flex-shrink-0">
                    {business.mainImageUrl ? (
                        <Image
                        src={business.mainImageUrl}
                        alt={business.title}
                        fill
                        className="object-cover rounded-md"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{business.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{business.category}</Badge>
                      <Badge variant={getStatusVariant(business.status)} className="capitalize">{business.status.replace('-', ' ')}</Badge>
                    </div>
                  </div>
                   <p className="text-sm text-muted-foreground mt-1">
                        Submitted by {business.ownerName} on {format(new Date(business.createdAt as string), 'PPP')}
                    </p>
                  <p className="text-sm mt-2 line-clamp-2">{business.description}</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 self-center md:self-auto">
                  <Button size="sm" onClick={() => handleActionClick(business, 'approve')}><CheckCircle className="mr-2 h-4 w-4"/>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleActionClick(business, 'reject')}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
       <AlertDialog open={!!(selectedBusiness && action)} onOpenChange={() => { setSelectedBusiness(null); setAction(null); }}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  You are about to {action} the business listing for "{selectedBusiness?.title}".
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmAction}>
                  Confirm {action?.charAt(0).toUpperCase() + action?.slice(1)}
              </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
