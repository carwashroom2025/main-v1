
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { BusinessForm } from '@/components/admin/business-form';
import { PlusCircle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCategories } from '@/lib/firebase/firestore';
import type { Category } from '@/lib/types';
import Link from 'next/link';

type ListBusinessProps = {
    onBusinessListed: () => void;
};

export function ListBusiness({ onBusinessListed }: ListBusinessProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            if (isFormOpen) {
                const cats = await getCategories();
                setCategories(cats);
            }
        }
        fetchCategories();
    }, [isFormOpen]);

    const handleListBusinessClick = () => {
        if (!user) {
            router.push('/login?redirect=/services');
            return;
        }

        if (['Member', 'Admin', 'Owner'].includes(user.role)) {
            setIsFormOpen(true);
        } else {
            setIsAlertOpen(true);
        }
    };

    const handleDataChange = () => {
        onBusinessListed();
        toast({
            title: "Listing Submitted",
            description: "Your business listing has been submitted and is waiting for admin approval.",
        });
    }

    return (
        <>
            <Button onClick={handleListBusinessClick} className="w-full md:w-auto h-12">
                <PlusCircle className="mr-2 h-4 w-4" />
                List Your Business
            </Button>

            <BusinessForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                business={null}
                onDataChange={handleDataChange}
                featuredCount={0}
                categories={categories}
            />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Upgrade Required</AlertDialogTitle>
                        <AlertDialogDescription>
                            You need to be a "Member" to list a business. Please upgrade your account to access this feature.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Link href="/profile">Go to Profile</Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
