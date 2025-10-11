
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { updateUser } from '@/lib/firebase/firestore';
import { createUserAsAdmin } from '@/lib/firebase/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/auth-context';

const allRoles = ['Owner', 'Admin', 'Author', 'Member', 'User'];

const createUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  role: z.enum(['Owner', 'Admin', 'Author', 'Member', 'User']),
});

const updateUserSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long.'),
    email: z.string().email('Email cannot be changed.'),
    password: z.string().optional(),
    role: z.enum(['Owner', 'Admin', 'Author', 'Member', 'User']),
});

type UserFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User | null;
  onDataChange: () => void;
};

export function UserForm({ isOpen, setIsOpen, user, onDataChange }: UserFormProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const isEditMode = !!user;

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'User',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
        form.reset({
            name: '',
            email: '',
            password: '',
            role: 'User',
        });
    }
  }, [user, isOpen, form]);

  const onSubmit: SubmitHandler<z.infer<typeof createUserSchema>> = async (data) => {
    try {
      if (isEditMode && user) {
        if (currentUser?.role !== 'Owner' && data.role === 'Owner') {
            toast({ title: 'Permission Denied', description: "Only an Owner can assign the 'Owner' role.", variant: 'destructive' });
            return;
        }
        if (currentUser?.role === 'Admin' && user.role === 'Owner') {
          toast({ title: 'Permission Denied', description: 'Admins cannot edit an Owner.', variant: 'destructive' });
          return;
        }
        if (currentUser?.role === 'Admin' && (data.role === 'Admin' || user.role === 'Admin')) {
            toast({ title: 'Permission Denied', description: 'Admins cannot assign or revoke the Admin role.', variant: 'destructive' });
            return;
        }
        await updateUser(user.id, { name: data.name, role: data.role });
        toast({
          title: 'User Updated',
          description: `${data.name}'s details have been updated.`,
        });
      } else {
        if (data.role === 'Owner' && currentUser?.role !== 'Owner') {
            toast({ title: 'Permission Denied', description: "You cannot create a new user with the 'Owner' role.", variant: 'destructive' });
            return;
        }
        if (data.role === 'Admin' && currentUser?.role !== 'Owner') {
            toast({ title: 'Permission Denied', description: "You cannot create a new user with the 'Admin' role.", variant: 'destructive' });
            return;
        }
        await createUserAsAdmin(data.email, data.password, data.name, data.role);
        toast({
          title: 'User Created',
          description: `A new account has been created for ${data.name}.`,
        });
      }
      onDataChange();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to save user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const canEditRole = currentUser?.role === 'Owner' || (user?.role !== 'Owner' && user?.role !== 'Admin');

  const availableRoles = allRoles.filter(role => {
    if (currentUser?.role === 'Owner') {
        return true;
    }
    return role !== 'Owner' && role !== 'Admin';
  });


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Update details for ${user.name}.` : 'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="py-4 space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                          <Input type="email" placeholder="name@email.com" {...field} disabled={isEditMode} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!isEditMode && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                            <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  )}
                 <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!canEditRole}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {availableRoles.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
