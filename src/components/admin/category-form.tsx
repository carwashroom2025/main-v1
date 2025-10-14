
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
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { uploadFile } from '@/lib/firebase/storage';
import { Progress } from '../ui/progress';

type CategoryFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  category: Category | null;
  onDataChange: () => void;
};

const initialFormData: Partial<Category> = {
  name: '',
  imageUrl: '',
};

export function CategoryForm({ isOpen, setIsOpen, category, onDataChange }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    try {
        const url = await uploadFile(file, 'category-images', setUploadProgress);
        setFormData(prev => ({...prev, imageUrl: url}));
        toast({ title: "Image Uploaded", description: "The image has been successfully uploaded." });
    } catch (error: any) {
        toast({ title: "Upload Failed", description: error.message, variant: 'destructive'});
    } finally {
        setUploadProgress(null);
    }
  }

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
        await addCategory(formData as Omit<Category, 'id' | 'createdAt'>);
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
                <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              {formData.imageUrl ? (
                  <div className="relative group w-full h-32">
                     <Image src={formData.imageUrl} alt={formData.name || 'Category image'} fill className="object-cover rounded-md" />
                     <Button
                         type="button"
                         variant="destructive"
                         size="icon"
                         className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                         onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}
                     >
                         <X className="h-4 w-4" />
                     </Button>
                  </div>
              ) : (
                  <div className="w-full">
                      <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50"
                      >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload</span>
                      </label>
                      <Input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                  </div>
              )}
              {uploadProgress !== null && <Progress value={uploadProgress} className="w-full mt-2" />}
            </div>
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading || uploadProgress !== null}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
