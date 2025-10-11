
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
import { MoreHorizontal, PlusCircle, Eye } from 'lucide-react';
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
import type { Business, Category } from '@/lib/types';
import { deleteBusiness } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { BusinessForm } from './business-form';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

type BusinessTableProps = {
  businesses: Business[];
  onDataChange: () => void;
  featuredCount: number;
  categories: Category[];
};

export function BusinessTable({ businesses, onDataChange, featuredCount, categories }: BusinessTableProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleEdit = (business: Business) => {
        setSelectedBusiness(business);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setSelectedBusiness(null);
        setIsFormOpen(true);
    }

    const handleDeleteClick = (business: Business) => {
        setBusinessToDelete(business);
        setIsAlertOpen(true);
    }

    const handleDeleteConfirm = async () => {
        if (!businessToDelete) return;
        try {
            await deleteBusiness(businessToDelete.id);
            toast({
                title: "Business Deleted",
                description: `"${businessToDelete.title}" has been successfully deleted.`,
            });
            onDataChange();
        } catch (error) {
            console.error("Failed to delete business:", error);
            toast({
                title: "Error",
                description: "Failed to delete business. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAlertOpen(false);
            setBusinessToDelete(null);
        }
    }

  return (
    <>
    <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Business
        </Button>
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((business) => (
            <TableRow key={business.id}>
              <TableCell className="font-medium">{business.title}</TableCell>
              <TableCell>{business.category}</TableCell>
              <TableCell>{business.location}</TableCell>
              <TableCell>
                <Badge variant={business.verified ? 'default' : 'secondary'}>
                  {business.verified ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={business.featured ? 'default' : 'secondary'}>
                  {business.featured ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                     <DropdownMenuItem asChild>
                        <Link href={`/services/${business.id}`} className="flex justify-between w-full">
                            <span>View</span>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleEdit(business)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDeleteClick(business)} className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <BusinessForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        business={selectedBusiness}
        onDataChange={onDataChange}
        featuredCount={featuredCount}
        categories={categories}
    />

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the business
                "{businessToDelete?.title}" and remove its data from our servers.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
