
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { signUp } from '@/lib/firebase/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/firebase/firestore';
import type { SecuritySettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

type RegisterSchema = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
        try {
            const settings = await getSettings('security');
            setSecuritySettings(settings);
        } catch (error) {
            console.error("Could not fetch security settings", error);
            // Assume registration is allowed if settings fail to load
            setSecuritySettings({ allowRegistration: true, maintenanceMode: false, defaultUserRole: 'User' });
        } finally {
            setLoading(false);
        }
    }
    fetchSettings();
  }, []);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<RegisterSchema> = async (data) => {
    try {
      await signUp(data.email, data.password, data.username);
      toast({
        title: 'Registration Successful',
        description: 'A verification email has been sent. Please check your inbox to activate your account.',
      });
      router.push('/login?verification=sent');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
            title: 'Registration Failed',
            description: 'This email is already in use. Please try logging in.',
            variant: 'destructive',
        });
      } else {
        console.error('Registration failed:', error);
        toast({
          title: 'Registration Failed',
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1520032549241-d8a1a6878342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8Y2FyJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzU4ODg1ODQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Register page background"
            fill
            className="object-cover"
            priority
            data-ai-hint="car interior"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Register</h1>
          <p className="mt-2 text-lg text-white/80">Create your Carwashroom account.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card className="mx-auto max-w-sm">
            <CardHeader className="text-center">
              <div onClick={() => router.push('/')} className="flex justify-center items-center space-x-2 mb-4 cursor-pointer">
                <span className="text-2xl font-bold uppercase">Car<span className="text-destructive">washroom</span></span>
              </div>
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : (securitySettings?.allowRegistration ? 'Enter your information to create an account' : 'New user registration is currently disabled.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
              ) : securitySettings?.allowRegistration ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="max_robinson" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="name@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input type={showPassword ? 'text' : 'password'} {...field} />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Creating Account...' : 'Create an account'}
                    </Button>
                  </form>
                </Form>
              ) : null}

              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
