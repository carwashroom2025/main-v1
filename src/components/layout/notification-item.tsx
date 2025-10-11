
'use client';

import Link from 'next/link';
import type { Activity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, List, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const iconMap = {
    review: MessageSquare,
    listing: List,
    question: MessageSquare,
    user: CheckCircle,
    default: MessageSquare
}

export function NotificationItem({ activity }: { activity: Activity }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const Icon = iconMap[activity.type as keyof typeof iconMap] || iconMap.default;

  const getLink = () => {
    switch (activity.type) {
        case 'review':
        case 'listing':
            return `/services/${activity.relatedId}`;
        case 'question':
            return `/faq/${activity.relatedId}`;
        default:
            return '#';
    }
  }

  return (
    <Link
      href={getLink()}
      className={cn(
        'flex items-start gap-3 rounded-md p-3 hover:bg-muted',
        !activity.read && 'bg-blue-500/10'
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground mt-1" />
      <div className="flex-1">
        <p className="text-sm">{activity.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {isClient ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true }) : '...'}
        </p>
      </div>
       {!activity.read && (
        <div className="h-2 w-2 rounded-full bg-primary self-center" />
      )}
    </Link>
  );
}
