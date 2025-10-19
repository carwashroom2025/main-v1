
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, CheckCircle, XCircle, UserX, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { User } from '@/lib/types';
import { updateUser, logActivity } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { UserForm } from './user-form';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';

type UserTableProps = {
  users: User[];
  onDataChange: () => void;
};

export function UserTable({ users, onDataChange }: UserTableProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setSelectedUser(null);
        setIsFormOpen(true);
    }

    const handleSuspendClick = (user: User) => {
        setUserToSuspend(user);
        setIsAlertOpen(true);
    }

    const handleToggleSuspendConfirm = async () => {
        if (!userToSuspend || !currentUser) return;
        
        const newStatus = userToSuspend.status === 'Active' ? 'Suspended' : 'Active';
        try {
            await updateUser(userToSuspend.id, { status: newStatus });
            await logActivity(`Moderator "${currentUser.name}" ${newStatus.toLowerCase()} user: "${userToSuspend.name}".`, 'user', userToSuspend.id, currentUser.id);
            toast({
                title: `User ${newStatus}`,
                description: `"${userToSuspend.name}" has been successfully ${newStatus.toLowerCase()}.`
            });
            onDataChange();
        } catch (error) {
            console.error('Failed to update user status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update user status. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsAlertOpen(false);
            setUserToSuspend(null);
        }
    }
    
    const handleVerifyUser = async (user: User) => {
        if (user.verified) return;
         if (!currentUser || !['Moderator', 'Administrator'].includes(currentUser.role)) {
            toast({ title: "Permission Denied", description: "You don't have permission to verify users.", variant: "destructive" });
            return;
        }
        try {
            await updateUser(user.id, { verified: true });
             toast({
                title: "User Verified",
                description: `"${user.name}" has been manually verified.`,
            });
            onDataChange();
        } catch (error) {
             console.error("Failed to verify user:", error);
            toast({
                title: "Error",
                description: "Failed to verify user. Please try again.",
                variant: "destructive",
            });
        }
    }

    const handleUnverifyUser = async (user: User) => {
        if (!user.verified) return;
        if (!currentUser || !['Moderator', 'Administrator'].includes(currentUser.role)) {
            toast({ title: "Permission Denied", description: "You don't have permission to unverify users.", variant: "destructive" });
            return;
        }
        try {
            await updateUser(user.id, { verified: false });
            toast({
                title: "User Unverified",
                description: `"${user.name}" has been unverified. They will need to verify via email to log in.`,
            });
            onDataChange();
        } catch (error) {
            console.error("Failed to unverify user:", error);
            toast({
                title: "Error",
                description: "Failed to unverify user. Please try again.",
                variant: "destructive",
            });
        }
    }
    
    const canManageUser = (user: User) => {
        if (!currentUser) return false;
        if (currentUser.id === user.id) return false; // Can't manage self
        if (currentUser.role === 'Administrator') return true;
        if (user.role === 'Administrator') return false; // Moderators can't manage Administrators
        if (user.role === 'Moderator') return false; // Moderators can't manage other Moderators
        return true;
    }

  return (
    <>
    <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New User
        </Button>
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                  {user.status}
                </Badge>
              </TableCell>
               <TableCell>
                <Badge variant={user.verified ? 'default' : 'secondary'}>
                  {user.verified ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
               <TableCell>{user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
              <TableCell>
                {canManageUser(user) ? (
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEdit(user)}>Edit</DropdownMenuItem>
                         <DropdownMenuSeparator />
                        {user.verified ? (
                            <DropdownMenuItem onSelect={() => handleUnverifyUser(user)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Unverify User
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onSelect={() => handleVerifyUser(user)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify User
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => handleSuspendClick(user)} className={user.status === 'Active' ? 'text-destructive' : ''}>
                            {user.status === 'Active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            {user.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <UserForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        user={selectedUser}
        onDataChange={onDataChange}
    />

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to {userToSuspend?.status === 'Active' ? 'suspend' : 'unsuspend'} this user?</AlertDialogTitle>
            <AlertDialogDescription>
                {userToSuspend?.status === 'Active' 
                    ? `Suspending "${userToSuspend?.name}" will prevent them from logging in.`
                    : `Unsuspending "${userToSuspend?.name}" will allow them to log in again.`}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleSuspendConfirm}>
                {userToSuspend?.status === 'Active' ? 'Suspend' : 'Unsuspend'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
