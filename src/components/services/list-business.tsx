

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { BusinessForm } from '@/components/admin/business-form';
import { PlusCircle } from 'lucide-react';
import { getCategories } from '@/lib/firebase/firestore';
import type { Category } from '@/lib/types';

type ListBusinessProps = {
    onBusinessListed: () => void;
};

export function ListBusiness({ onBusinessListed }: ListBusinessProps) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
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
        setIsFormOpen(true);
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
        </>
    );
}
