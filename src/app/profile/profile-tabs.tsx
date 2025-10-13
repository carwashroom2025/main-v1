
'use client';

import { useAuth } from '@/context/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProfileSettingsTab } from '@/components/profile/ProfileSettingsTab';
import { FavoriteCarsTab } from '@/components/profile/FavoriteCarsTab';
import { FavoriteBusinessesTab } from '@/components/profile/FavoriteBusinessesTab';
import { MyBusinessesTab } from '@/components/profile/MyBusinessesTab';
import { MyActivityTab } from '@/components/profile/MyActivityTab';

export default function ProfileTabs() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  const isMember = user && ['Member', 'Admin', 'Owner', 'Author'].includes(user.role);

  if (loading) {
    return <div className="container py-12">Loading profile...</div>;
  }

  if (!user) {
    return <div className="container py-12">Please log in to view your profile.</div>;
  }

  const tabList = [
    { value: 'profile', label: 'Profile Settings' },
    { value: 'fav-cars', label: 'Favorite Cars' },
    { value: 'fav-businesses', label: 'Favorite Businesses' },
    isMember && { value: 'my-businesses', label: 'My Businesses' },
    { value: 'activity', label: 'My Activity' },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <div className="container py-12">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={cn('grid w-full max-w-4xl mx-auto', {
          'grid-cols-4': tabList.length === 4,
          'grid-cols-5': tabList.length === 5,
        })}>
          {tabList.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettingsTab />
        </TabsContent>

        <TabsContent value="fav-cars">
          <FavoriteCarsTab />
        </TabsContent>

        <TabsContent value="fav-businesses">
          <FavoriteBusinessesTab />
        </TabsContent>

        {isMember && (
          <TabsContent value="my-businesses">
            <MyBusinessesTab />
          </TabsContent>
        )}

        <TabsContent value="activity">
          <MyActivityTab />
        </TabsContent>

      </Tabs>
    </div>
  );
}
