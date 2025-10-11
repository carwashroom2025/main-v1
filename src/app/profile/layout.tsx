
'use client';

import { useAuth } from '@/context/auth-context';
import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// export const metadata: Metadata = {
//   title: 'My Profile | AutoConnect Hub',
// };

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/login?redirect=${pathname}`);
        }
    }, [user, loading, router, pathname]);

    if (loading || !user) {
        return (
             <div className="container py-12 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

  return (
    <>
      {children}
    </>
  );
}
