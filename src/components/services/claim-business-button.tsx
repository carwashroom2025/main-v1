
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Business } from '@/lib/types';
import { submitBusinessClaim, getPendingClaimForBusiness } from '@/lib/firebase/firestore';

type ClaimBusinessButtonProps = {
  business: Business;
};

export function ClaimBusinessButton({ business }: ClaimBusinessButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'pending' | 'owned'>('idle');

  useEffect(() => {
    async function checkExistingClaim() {
      if (user && business) {
        const existingClaim = await getPendingClaimForBusiness(business.id, user.id);
        if (existingClaim) {
          setClaimStatus('pending');
        }
      }
    }
    checkExistingClaim();
  }, [user, business]);

  const handleClaimClick = () => {
    if (!user) {
      router.push(`/login?redirect=/services/${business.id}`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    
    try {
      await submitBusinessClaim({
        businessId: business.id,
        businessName: business.title,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        verificationDetails: verificationDetails,
      });
      
      toast({
        title: 'Claim Submitted',
        description: 'Your claim has been submitted for review. You will be notified upon approval.',
      });
      setClaimStatus('pending');
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Claim submission error:', error);
      toast({
        title: 'Error Submitting Claim',
        description: error.message || 'There was an issue submitting your claim. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (claimStatus === 'pending') {
    return <Button variant="outline" disabled>Claim Pending</Button>;
  }

  return (
    <>
      <Button variant="outline" onClick={handleClaimClick}>
        Claim this Business
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim "{business.title}"</DialogTitle>
            <DialogDescription>
              To claim this business, please provide details to verify your ownership. This will be reviewed by an administrator.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div>
              <Label htmlFor="verification-details">Verification Details</Label>
              <Textarea
                id="verification-details"
                placeholder="e.g., I am the owner, my contact number is X. You can find my name on the company website."
                rows={4}
                value={verificationDetails}
                onChange={(e) => setVerificationDetails(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
