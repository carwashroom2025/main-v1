
'use client';

import { useState, useEffect } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/context/auth-context';
import { getUserActivities, updateActivityReadStatus, clearUserActivities } from '@/lib/firebase/firestore';
import type { Activity } from '@/lib/types';
import { NotificationItem } from './notification-item';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function NotificationBell() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;
    const userActivities = await getUserActivities(user.id);
    setActivities(userActivities);
    setUnreadCount(userActivities.filter(a => !a.read).length);
  };


  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (!open && unreadCount > 0) {
      // Mark all as read when popover closes
      const unreadIds = activities.filter(a => !a.read).map(a => a.id);
      if (unreadIds.length > 0) {
        await updateActivityReadStatus(unreadIds);
        setUnreadCount(0);
        setActivities(prev => prev.map(a => ({ ...a, read: true })));
      }
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    try {
        await clearUserActivities(user.id);
        toast({
            title: 'Notifications Cleared',
            description: 'All your notifications have been deleted.',
        });
        fetchActivities(); // Re-fetch to get an empty list
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Could not clear notifications.',
            variant: 'destructive',
        });
    }
  }

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 flex justify-between items-center">
            <h4 className="font-medium text-sm">Notifications</h4>
            {activities.length > 0 && (
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                </Button>
            )}
        </div>
        <Separator />
        <ScrollArea className="h-96">
            <div className="p-2">
            {activities.length > 0 ? (
                activities.map((activity) => (
                    <NotificationItem key={activity.id} activity={activity} />
                ))
            ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
            )}
            </div>
        </ScrollArea>
        <Separator />
        <div className="p-2">
             <Button variant="link" asChild className="w-full">
                <Link href="/profile?tab=activity">View all activity</Link>
             </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
