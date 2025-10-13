
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { uploadFile, deleteFile, listFiles } from '@/lib/firebase/storage';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Trash2, Copy } from 'lucide-react';
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

const STORAGE_PATH = 'gallery-images';

type UploadingFile = {
    name: string;
    progress: number;
};

type StoredImage = {
    url: string;
    fullPath: string;
};

export default function StoragePage() {
    const [images, setImages] = useState<StoredImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<StoredImage | null>(null);
    const { toast } = useToast();

    const fetchImages = async () => {
        setLoading(true);
        try {
            const files = await listFiles(STORAGE_PATH);
            setImages(files);
        } catch (error: any) {
            toast({ title: 'Error', description: 'Could not fetch images from storage.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newUploads: UploadingFile[] = Array.from(files).map(file => ({ name: file.name, progress: 0 }));
        setUploadingFiles(prev => [...prev, ...newUploads]);

        for (const file of Array.from(files)) {
            try {
                await uploadFile(file, STORAGE_PATH, (progress) => {
                    setUploadingFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress } : f));
                });
            } catch (error: any) {
                toast({ title: 'Upload Failed', description: `Could not upload ${file.name}.`, variant: 'destructive' });
            }
        }
        
        setUploadingFiles([]);
        fetchImages(); // Refresh the list
    };
    
    const handleDeleteClick = (image: StoredImage) => {
        setImageToDelete(image);
        setIsAlertOpen(true);
    };
    
    const handleDeleteConfirm = async () => {
        if (!imageToDelete) return;
        try {
            await deleteFile(imageToDelete.fullPath);
            toast({ title: 'Image Deleted', description: 'The image has been removed from storage.' });
            fetchImages();
        } catch (error: any) {
             toast({ title: 'Error', description: 'Failed to delete the image.', variant: 'destructive' });
        } finally {
            setIsAlertOpen(false);
            setImageToDelete(null);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: 'URL Copied', description: 'Image URL copied to clipboard.' });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Storage</CardTitle>
                <CardDescription>Upload, view, and delete images from your gallery.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <label
                        htmlFor="image-upload"
                        className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/20 p-8 text-center cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                        <div className="space-y-2 text-muted-foreground">
                            <Upload className="mx-auto h-12 w-12" />
                            <p className="font-semibold">Click or drag files to upload</p>
                            <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </label>
                    <Input id="image-upload" type="file" className="sr-only" multiple onChange={handleFileSelect} />
                </div>
                
                {uploadingFiles.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {uploadingFiles.map(file => (
                            <div key={file.name}>
                                <p className="text-sm text-muted-foreground">{file.name}</p>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${file.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div>
                    <h3 className="text-lg font-medium mb-4">Uploaded Images</h3>
                     {loading ? (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
                         </div>
                     ) : images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map((image) => (
                                <div key={image.url} className="group relative aspect-square">
                                    <Image src={image.url} alt="Uploaded image" fill className="object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(image.url)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(image)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-semibold">No Images Found</h3>
                            <p className="text-muted-foreground mt-2">Upload some images to see them here.</p>
                        </div>
                     )}
                </div>
            </CardContent>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the image from your storage.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
