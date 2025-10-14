
import { Suspense } from 'react';
import LoginForm from './login-form';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <>
      <div className="container flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <Suspense fallback={<Skeleton className="h-96 w-full max-w-sm" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
