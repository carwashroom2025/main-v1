
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { signIn, resendVerificationEmail } from '@/lib/firebase/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showResend, setShowResend] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (searchParams.get('verification') === 'sent') {
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox to activate your account before logging in.',
      });
    }
  }, [searchParams, toast]);

  const handleResendVerification = async () => {
    try {
        const email = form.getValues('email');
        if (!email) {
            toast({ title: 'Error', description: 'Please enter your email first.', variant: 'destructive'});
            return;
        }
        await resendVerificationEmail(email);
        toast({ title: 'Verification Email Sent', description: 'A new verification link has been sent to your email.'});
    } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive'});
    }
  }


  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    setShowResend(false);
    try {
      await signIn(data.email, data.password, data.rememberMe);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (error: any) {
      if (error.name === 'EmailNotVerified') {
        setShowResend(true);
      } else if (error.name === 'AccountSuspended') {
        toast({
          title: 'Account Suspended',
          description: error.message,
          variant: 'destructive',
        });
      } 
      else {
        console.error('Login failed:', error);
        toast({
          title: 'Login Failed',
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <>
        <div className="grid gap-4">
            {showResend && (
                <Alert className="mb-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Email Not Verified</AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                        <span>Please verify your email.</span>
                        <Button variant="link" size="sm" onClick={handleResendVerification} className="p-0 h-auto">
                            Resend Link
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="name@email.com" {...field} />
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
                        <div className="flex items-center">
                            <FormLabel>Password</FormLabel>
                            <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                                Forgot your password?
                            </Link>
                        </div>
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
                <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>
                        Remember me
                        </FormLabel>
                    </div>
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
            </form>
            </Form>
        </div>
        <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
                Sign up
            </Link>
        </div>
    </>
  );
}
