
'use client';

import { AdminNav } from '@/components/layout/admin-nav';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Loading from '../loading';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
        router.push('/login?redirect=/admin');
    } else if (!loading && user && !['Admin', 'Owner'].includes(user.role)) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || !['Admin', 'Owner'].includes(user.role)) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/4">
            <AdminNav />
            </aside>
            <main className="flex-1">
            {children}
            </main>
        </div>
    </div>
  );
}
