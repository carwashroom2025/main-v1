
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { updateUser } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { sendPasswordReset } from '@/lib/firebase/auth';
import { format } from 'date-fns';
import { ProfileImageUploader } from '@/components/profile/profile-image-uploader';
import type { User } from '@/lib/types';

export function ProfileSettingsTab() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (!user) {
    return null;
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
    <Card className="max-w-4xl mx-auto mt-6">
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="flex flex-col items-center text-center">
            <ProfileImageUploader user={user} onAvatarChange={handleAvatarUpdate} />
            <h2 className="text-2xl font-semibold mt-4">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-2">{user.role}</Badge>
          </div>
          <Separator />
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-muted-foreground tracking-wider uppercase">Details</h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Joined:</span>
              <span className="font-medium">{user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'}</span>
            </div>
            {user.lastLogin && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Login:</span>
                <span className="font-medium">{format(user.lastLogin.toDate(), 'PPp')}</span>
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This is how others will see you on the site.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
