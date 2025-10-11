
import { Suspense } from 'react';
import ProfileTabs from './profile-tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function ProfilePage() {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1568605117036-5fe5e7185743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjYXJ8ZW58MHx8fHwxNzU4ODg1ODQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Profile page background"
            fill
            className="object-cover"
            priority
            data-ai-hint="car driver"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
          <p className="mt-2 text-lg text-white/80">
            View and manage your account details.
          </p>
        </div>
      </div>
      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfileTabs />
      </Suspense>
    </>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="container py-12 space-y-6">
        <Skeleton className="h-10 w-full max-w-3xl mx-auto" />
        <Skeleton className="h-96 w-full max-w-4xl mx-auto" />
    </div>
  )
}
