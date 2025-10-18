
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { updateUser } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordReset } from '@/lib/firebase/auth';
import { ProfileImageUploader } from '@/components/profile/profile-image-uploader';
import { Skeleton } from '../ui/skeleton';

export function ProfileSettingsTab() {
  const { user, setUser, loading } = useAuth();
  const [name, setName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (loading || !user) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUser(user.id, { name });
      setUser(prev => prev ? { ...prev, name } : null);
      toast({
        title: 'Profile Updated',
        description: 'Your name has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleAvatarUpdate = async (avatarUrl: string) => {
    if (!user) return;
    try {
      await updateUser(user.id, { avatarUrl });
      setUser((prevUser) => (prevUser ? { ...prevUser, avatarUrl } : null));
      toast({
          title: 'Avatar Updated',
          description: 'Your profile picture has been successfully updated.',
      });
    } catch (error) {
        console.error('Failed to update avatar:', error);
        toast({
            title: 'Error',
            description: 'Failed to update your avatar. Please try again.',
            variant: 'destructive',
        });
    }
  };

  const handlePasswordReset = async () => {
    if (!user) return;
    try {
      await sendPasswordReset(user.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox to reset your password.',
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
      <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This is how others will see you on the site.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                 <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <ProfileImageUploader user={user} onAvatarChange={handleAvatarUpdate} />
                 </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (cannot be changed)</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                  />
                </div>
                <Button type="submit">Update Profile</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Change your password by receiving a reset link via email.</p>
                <Button variant="outline" onClick={handlePasswordReset}>Reset Password</Button>
              </div>
            </CardContent>
          </Card>
        </div>
  );
}
