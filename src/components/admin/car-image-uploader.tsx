
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { uploadFile, deleteFile } from '@/lib/firebase/storage';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type CarImageUploaderProps = {
  imageId: string | null;
  onImageIdChange: (imageId: string) => void;
};

export function CarImageUploader({ imageId, onImageIdChange }: CarImageUploaderProps) {
  const [upload, setUpload] = useState<{ file: File, progress: number } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpload({ file, progress: 0 });
    
    uploadFile(file, 'vehicle-images', (progress) => {
        setUpload(prev => prev ? { ...prev, progress } : null);
    }).then(url => {
        // This is a simplified approach. In a real app, you'd add this to a collection of uploaded images
        // and get a new ID. For now, we'll just use a placeholder ID format.
        const newImageId = `uploaded-${Date.now()}`;
        console.log(`New image uploaded with placeholder ID: ${newImageId} and URL: ${url}`);
        // To make this work, you would need a way to add the new URL to your placeholder data source
        // or switch to a dynamic data source for images.
        toast({ title: 'Image Uploaded', description: 'Image is ready, but a placeholder ID is used. Update your image source logic.'})
        onImageIdChange(newImageId);
        setUpload(null);
    }).catch(error => {
        console.error("Upload failed", error);
        toast({
            title: 'Upload Failed',
            description: 'Could not upload the image. Please try again.',
            variant: 'destructive'
        });
        setUpload(null);
    });
  };

  const handleRemoveImage = async () => {
    if (imageId) {
        // This is also simplified. If the image was from placeholder-images.json, it's not in storage.
        const image = PlaceHolderImages.find(img => img.id === imageId);
        if (image && image.imageUrl.includes('firebasestorage')) {
             try {
                await deleteFile(image.imageUrl);
             } catch (error) {
                console.error("Failed to delete image from storage:", error);
             }
        }
        onImageIdChange('');
        toast({
            title: 'Image Removed',
            description: 'The image has been successfully removed.',
        });
    }
  }
  
  const currentImage = PlaceHolderImages.find(img => img.id === imageId);

  return (
    <div className="space-y-4">
      <div>
        <Label className="font-semibold">Main Image</Label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentImage && (
            <div className="relative group aspect-square">
              <Image src={currentImage.imageUrl} alt={currentImage.description || 'Vehicle image'} fill className="object-cover rounded-md" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {!imageId && (
            <div className="aspect-square flex items-center justify-center rounded-md border-2 border-dashed">
              <Label htmlFor="main-image-upload" className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
                <span>Upload Main Image</span>
              </Label>
              <Input id="main-image-upload" type="file" className="sr-only" onChange={handleFileSelect} accept="image/*" />
            </div>
          )}
        </div>
      </div>
      
       {upload && (
        <div className="space-y-2">
            <h4 className="font-medium">Uploading...</h4>
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground truncate">{upload.file.name}</p>
                <Progress value={upload.progress} />
            </div>
        </div>
       )}
    </div>
  );
}
