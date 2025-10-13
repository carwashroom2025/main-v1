
'use client';

import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Calendar, LogIn } from 'lucide-react';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

export function ProfileHeader() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <ProfileHeaderSkeleton />;
  }
  
  const memberSince = user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A';
  const lastLogin = user.lastLogin ? format(user.lastLogin.toDate(), 'PPP p') : 'Never';


  return (
    <div className="w-full rounded-lg bg-card border p-6 flex flex-col md:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-3xl">
                <User className="h-10 w-10 text-muted-foreground" />
            </AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-2">{user.role}</Badge>
        </div>
        <div className="text-sm text-muted-foreground space-y-2 text-center md:text-right">
             <div className="flex items-center justify-center md:justify-end gap-2">
                <Calendar className="h-4 w-4" />
                <span>Member since: {memberSince}</span>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2">
                <LogIn className="h-4 w-4" />
                <span>Last login: {lastLogin}</span>
            </div>
        </div>
    </div>
  );
}


function ProfileHeaderSkeleton() {
    return (
        <div className="w-full rounded-lg bg-card border p-6 flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-6 w-20" />
            </div>
        </div>
    )
}
