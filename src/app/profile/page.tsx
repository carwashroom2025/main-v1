
'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { useSearchParams } from 'next/navigation';
import { ProfileSettingsTab } from '@/components/profile/ProfileSettingsTab';
import { FavoriteCarsTab } from '@/components/profile/FavoriteCarsTab';
import { FavoriteBusinessesTab } from '@/components/profile/FavoriteBusinessesTab';
import { MyBusinessesTab } from '@/components/profile/MyBusinessesTab';
import { MyActivityTab } from '@/components/profile/MyActivityTab';
import { useAuth } from '@/context/auth-context';

function ProfileContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  return (
    <div className="container py-12">
        <ProfileHeader />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            <aside className="md:col-span-1">
                 <ProfileSidebar />
            </aside>
            <main className="md:col-span-3">
               {activeTab === 'profile' && <ProfileSettingsTab />}
               {activeTab === 'fav-cars' && <FavoriteCarsTab />}
               {activeTab === 'fav-businesses' && <FavoriteBusinessesTab />}
               {activeTab === 'my-businesses' && <MyBusinessesTab />}
               {activeTab === 'activity' && <MyActivityTab />}
            </main>
        </div>
    </div>
  );
}


export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfileContent />
    </Suspense>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="container py-12 space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Skeleton className="h-64 w-full" />
            <div className="md:col-span-3">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    </div>
  )
}
