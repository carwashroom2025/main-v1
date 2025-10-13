
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { User, Heart, Briefcase, Activity, Settings } from 'lucide-react';

export function ProfileSidebar() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const isMember = user && ['Member', 'Admin', 'Owner', 'Author'].includes(user.role);

  const navLinks = [
    { value: 'profile', label: 'Profile Settings', icon: Settings },
    { value: 'fav-cars', label: 'Favorite Cars', icon: Heart },
    { value: 'fav-businesses', label: 'Favorite Businesses', icon: Heart },
    isMember && { value: 'my-businesses', label: 'My Businesses', icon: Briefcase },
    { value: 'activity', label: 'My Activity', icon: Activity },
  ].filter(Boolean) as { value: string; label: string, icon: React.ElementType }[];

  return (
    <nav className="flex flex-col gap-2 sticky top-24">
      {navLinks.map((link) => {
        const Icon = link.icon;
        return (
            <Link
                key={link.value}
                href={`/profile?tab=${link.value}`}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary',
                    activeTab === link.value && 'bg-muted text-primary font-semibold'
                )}
                prefetch={false}
            >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
            </Link>
        )
    })}
    </nav>
  );
}
