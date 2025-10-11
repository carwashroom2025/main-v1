

'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getCategories, seedInitialCategories } from '@/lib/firebase/firestore';
import type { Category } from '@/lib/types';
import { CategoryTable } from '@/components/admin/category-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PackagePlus } from 'lucide-react';

export default function ManageCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const { toast } = useToast();

    const fetchCategories = async () => {
        setLoading(true);
        const categoriesFromDb = await getCategories();
        setCategories(categoriesFromDb);
        setLoading(false);
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSeedCategories = async () => {
        setSeeding(true);
        try {
            const result = await seedInitialCategories();
            toast({
                title: result.count > 0 ? "Categories Seeded" : "Seeding Skipped",
                description: result.message,
            });
            if (result.count > 0) {
                fetchCategories();
            }
        } catch (error: any) {
            console.error("Failed to seed categories:", error);
            toast({
                title: 'Error',
                description: 'Could not seed initial categories. Please check permissions.',
                variant: 'destructive',
            });
        } finally {
            setSeeding(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Manage Categories</CardTitle>
                    <CardDescription>
                    Create, edit, or delete service categories.
                    </CardDescription>
                </div>
                <Button 
                    onClick={handleSeedCategories} 
                    disabled={loading || seeding || categories.length > 0}
                >
                    <PackagePlus className="mr-2 h-4 w-4" />
                    {seeding ? 'Seeding...' : 'Seed Initial Categories'}
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <CategoryTable categories={categories} onDataChange={fetchCategories} />
                )}
            </CardContent>
        </Card>
    );
}
