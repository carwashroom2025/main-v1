
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
import { MoreHorizontal, PlusCircle, ImageIcon, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
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
import type { Category } from '@/lib/types';
import { deleteCategory, deleteMultipleCategories } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { CategoryForm } from './category-form';
import Image from 'next/image';
import { Checkbox } from '../ui/checkbox';

type CategoryTableProps = {
  categories: Category[];
  onDataChange: () => void;
};

export function CategoryTable({ categories, onDataChange }: CategoryTableProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleteSelectedAlertOpen, setIsDeleteSelectedAlertOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { toast } = useToast();

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    }

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setIsAlertOpen(true);
    }

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteCategory(categoryToDelete.id);
            toast({
                title: "Category Deleted",
                description: `"${categoryToDelete.name}" has been successfully deleted.`,
            });
            onDataChange();
        } catch (error) {
            console.error("Failed to delete category:", error);
            toast({
                title: "Error",
                description: "Failed to delete category. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAlertOpen(false);
            setCategoryToDelete(null);
        }
    }
    
    const handleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedIds(categories.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    }
    
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        try {
            await deleteMultipleCategories(selectedIds);
            toast({
                title: `${selectedIds.length} Categories Deleted`,
                description: "The selected categories have been successfully deleted.",
            });
            setSelectedIds([]);
            onDataChange();
        } catch (error) {
            console.error("Failed to delete selected categories:", error);
            toast({
                title: "Error",
                description: "Failed to delete selected categories. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleteSelectedAlertOpen(false);
        }
    }

  return (
    <>
    <div className="flex justify-end mb-4 gap-2">
        {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={() => setIsDeleteSelectedAlertOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedIds.length})
            </Button>
        )}
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Category
        </Button>
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
             <TableHead className="w-12">
                <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length === categories.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                />
            </TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id} data-state={selectedIds.includes(category.id) && "selected"}>
              <TableCell>
                  <Checkbox
                      checked={selectedIds.includes(category.id)}
                      onCheckedChange={() => handleSelect(category.id)}
                      aria-label="Select row"
                  />
              </TableCell>
              <TableCell>
                  <div className="w-16 h-10 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                    {category.imageUrl ? (
                        <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                    ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
              </TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
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
                    <DropdownMenuItem onSelect={() => handleEdit(category)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDeleteClick(category)} className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <CategoryForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        category={selectedCategory}
        onDataChange={onDataChange}
    />

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category
                "{categoryToDelete?.name}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
     <AlertDialog open={isDeleteSelectedAlertOpen} onOpenChange={setIsDeleteSelectedAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {selectedIds.length} selected categories.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
