
import { Suspense } from 'react';
import LoginForm from './login-form';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
           <Suspense fallback={<Skeleton className="h-96 w-full max-w-sm" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwb3JzY2hlfGVufDB8fHx8MTc1ODU4NjY5Nnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="sports car"
        />
        <div className="absolute bottom-8 left-8 right-8 p-8 bg-black/50 backdrop-blur-md rounded-lg">
            <h2 className="text-3xl font-bold text-white">Welcome Back to Carwashroom</h2>
            <p className="text-white/80 mt-2">The best way to find cars and services from local and trusted businesses.</p>
        </div>
      </div>
    </div>
  );
}
