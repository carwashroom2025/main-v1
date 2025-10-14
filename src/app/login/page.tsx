
import { Suspense } from 'react';
import LoginForm from './login-form';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwb3JzY2hlfGVufDB8fHx8MTc1ODU4NjY5Nnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Login page background"
            fill
            className="object-cover"
            priority
            data-ai-hint="sports car"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Login</h1>
          <p className="mt-2 text-lg text-white/80">Access your Carwashroom account.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
            <Card className="mx-auto max-w-sm">
                <CardHeader className="text-center">
                    <Link href="/" className="flex justify-center items-center space-x-2 mb-4">
                        <span className="text-2xl font-bold uppercase">Car<span className="text-destructive">washroom</span></span>
                    </Link>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your email below to login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                        <LoginForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
