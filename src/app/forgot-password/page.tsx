
'use client';

import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordReset } from '@/lib/firebase/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordSchema> = async (data) => {
    try {
      await sendPasswordReset(data.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox for instructions to reset your password.',
      });
      form.reset();
    } catch (error: any) {
      console.error('Password reset failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1543286386-713bdd548da4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxlbWFpbHxlbnwwfHx8fDE3NTg4ODU4NDF8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Forgot password"
            fill
            className="object-cover"
            priority
            data-ai-hint="email security"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Forgot Password</h1>
          <p className="mt-2 text-lg text-white/80">Reset your password via email.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card className="mx-auto max-w-sm">
            <CardHeader className="text-center">
                <Link href="/" className="flex justify-center items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold uppercase">Car<span className="text-destructive">washroom</span></span>
                </Link>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>Enter your email to receive a password reset link.</CardDescription>
            </CardHeader>
            <CardContent>
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
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                Remember your password?{' '}
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
