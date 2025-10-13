
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getUserActivities } from '@/lib/firebase/firestore';
import type { Activity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationItem } from '@/components/layout/notification-item';

export function MyActivityTab() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const fetchActivities = async () => {
        const userActivities = await getUserActivities(user.id, 20);
        setActivities(userActivities);
        setLoading(false);
      };
      fetchActivities();
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Activity</CardTitle>
        <CardDescription>A log of your recent reviews and comments.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-1">
            {activities.map((activity) => (
              <NotificationItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            You have no recent activity.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
