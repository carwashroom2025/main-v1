
import { Suspense } from 'react';
import LoginForm from './login-form';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
              src="https://images.unsplash.com/photo-1526726538640-74c1084f28e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYXIrfGVufDB8fHx8MTc1ODg4NTg0MXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Login page background"
              fill
              className="object-cover"
              priority
              data-ai-hint="car key"
          />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Login</h1>
          <p className="mt-2 text-lg text-white/80">Access your Carwashroom account.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Suspense fallback={<Skeleton className="h-96 w-full max-w-sm" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
