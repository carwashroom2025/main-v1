
'use client';

import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { addCategory, updateCategory } from '@/lib/firebase/firestore';

type CategoryFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  category: Category | null;
  onDataChange: () => void;
};

const initialFormData: Omit<Category, 'id' | 'createdAt'> = {
  name: '',
};

export function CategoryForm({ isOpen, setIsOpen, category, onDataChange }: CategoryFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
        if (category) {
            setFormData(category);
        } else {
            setFormData(initialFormData);
        }
    }
  }, [category, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category) {
        await updateCategory(category.id, formData);
        toast({
          title: 'Category Updated',
          description: `"${formData.name}" has been successfully updated.`,
        });
      } else {
        await addCategory(formData);
        toast({
          title: 'Category Added',
          description: `"${formData.name}" has been successfully added.`,
        });
      }
      onDataChange();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {category ? 'Update the details of the category.' : 'Fill in the details for the new category.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
