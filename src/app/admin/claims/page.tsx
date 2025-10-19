
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getPendingClaims, approveClaim, rejectClaim, logActivity } from '@/lib/firebase/firestore';
import type { BusinessClaim } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';
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
import Link from 'next/link';

export default function ApproveClaimsPage() {
  const [pendingClaims, setPendingClaims] = useState<BusinessClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<BusinessClaim | null>(null);

  const fetchPendingClaims = async () => {
    setLoading(true);
    try {
      const claims = await getPendingClaims();
      setPendingClaims(claims);
    } catch (error) {
      console.error("Failed to fetch pending claims:", error);
      toast({
        title: "Error",
        description: "Could not fetch pending claims.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingClaims();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActionClick = (claim: BusinessClaim, type: 'approve' | 'reject') => {
    setSelectedClaim(claim);
    setAction(type);
  };
  
  const handleConfirmAction = async () => {
    if (!user || !selectedClaim || !action) return;
    if (!['Moderator', 'Administrator'].includes(user.role)) {
        toast({ title: "Permission Denied", description: "You are not authorized to perform this action.", variant: "destructive" });
        return;
    }

    try {
        if (action === 'approve') {
            await approveClaim(selectedClaim.id, user.id);
            await logActivity(`Admin "${user.name}" approved claim for business: "${selectedClaim.businessName}".`, 'claim', selectedClaim.businessId, selectedClaim.userId);
            toast({
                title: "Claim Approved",
                description: `"${selectedClaim.businessName}" has been assigned to ${selectedClaim.userName}.`,
            });
        } else if (action === 'reject') {
            await rejectClaim(selectedClaim.id, user.id);
            await logActivity(`Admin "${user.name}" rejected claim for business: "${selectedClaim.businessName}".`, 'claim', selectedClaim.businessId, selectedClaim.userId);
            toast({
                title: "Claim Rejected",
                description: `Claim for "${selectedClaim.businessName}" has been rejected.`,
                variant: "destructive",
            });
        }
        
        fetchPendingClaims();
    } catch (error: any) {
        console.error(`Failed to ${action} claim:`, error);
        toast({
            title: "Error",
            description: `Failed to ${action} the claim. ${error.message}`,
            variant: "destructive",
        });
    } finally {
        setSelectedClaim(null);
        setAction(null);
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approve Business Claims</CardTitle>
        <CardDescription>
          Review and approve new business ownership claims submitted by users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : pendingClaims.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            There are no pending claims to review.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingClaims.map((claim) => (
              <Card key={claim.id} className="p-4">
                 <div className="flex flex-col md:flex-row items-start gap-4">
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                         <h3 className="font-semibold text-lg">
                            <Link href={`/services/${claim.businessId}`} className="hover:underline" target="_blank">{claim.businessName}</Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Claimed on {format(claim.createdAt.toDate(), 'PPP')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                            Claimed by: <span className="font-medium text-foreground">{claim.userName}</span> ({claim.userEmail})
                      </p>
                      <p className="text-sm mt-4 text-foreground bg-muted p-3 rounded-md border">{claim.verificationDetails}</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 self-center md:self-auto">
                      <Button size="sm" onClick={() => handleActionClick(claim, 'approve')}><CheckCircle className="mr-2 h-4 w-4"/>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleActionClick(claim, 'reject')}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
                    </div>
                 </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
       <AlertDialog open={!!(selectedClaim && action)} onOpenChange={() => { setSelectedClaim(null); setAction(null); }}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  You are about to {action} the ownership claim for "{selectedClaim?.businessName}" by {selectedClaim?.userName}.
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
