
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input }from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { auth } from '@/lib/firebase/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from '@/lib/firebase/auth';


export default function ActionHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const continueUrl = searchParams.get('continueUrl');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resetting'>('loading');
  const [message, setMessage] = useState('Processing your request...');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus('error');
      setMessage('Invalid request. Missing required parameters.');
      return;
    }

    switch (mode) {
      case 'verifyEmail':
        handleVerifyEmail();
        break;
      case 'resetPassword':
        handleVerifyPasswordReset();
        break;
      default:
        setStatus('error');
        setMessage('Unsupported action type.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, oobCode]);

  const handleVerifyEmail = async () => {
    if (!oobCode) return;
    try {
      await applyActionCode(auth, oobCode);
      setStatus('success');
      setMessage('Your email has been successfully verified! You can now log in.');
      toast({
        title: 'Email Verified',
        description: 'You can now log in with your credentials.',
      });
      // Optionally redirect after a delay
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Failed to verify email. The link may be invalid or expired.');
      console.error('Email verification error:', error);
    }
  };

  const handleVerifyPasswordReset = async () => {
    if (!oobCode) return;
    try {
      await verifyPasswordResetCode(oobCode);
      setStatus('resetting');
      setMessage('Please enter your new password.');
    } catch (error) {
      setStatus('error');
      setMessage('Invalid or expired password reset link. Please request a new one.');
      console.error('Password reset code verification error:', error);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast({ title: 'Error', description: 'Please enter a new password.', variant: 'destructive'});
      return;
    }
    if (!oobCode) return;
    
    try {
      await confirmPasswordReset(oobCode, newPassword);
      setStatus('success');
      setMessage('Your password has been successfully reset! You can now log in with your new password.');
      toast({
        title: 'Password Reset',
        description: 'You can now log in with your new password.',
      });
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Failed to reset password. Please try again.');
      console.error('Password reset confirmation error:', error);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'An Error Occurred'}
            {status === 'resetting' && 'Reset Your Password'}
          </CardTitle>
          <CardDescription>
            {status === 'resetting' ? 'Choose a new strong password.' : 'Handling your authentication request.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>{message}</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p>{message}</p>
              <Button asChild><Link href="/login">Go to Login</Link></Button>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <p>{message}</p>
              <Button asChild><Link href="/">Back to Home</Link></Button>
            </div>
          )}
          {status === 'resetting' && (
            <form onSubmit={handleConfirmPasswordReset} className="space-y-4 text-left">
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                  />
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setShowPassword(prev => !prev)}
                  >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">Set New Password</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
