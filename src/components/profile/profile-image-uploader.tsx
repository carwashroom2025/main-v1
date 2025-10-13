
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { uploadFile, deleteFile } from '@/lib/firebase/storage';
import { Loader2, User as UserIcon, Edit } from 'lucide-react';
import type { User } from '@/lib/types';

type ProfileImageUploaderProps = {
  user: User;
  onAvatarChange: (url: string) => void;
};

export function ProfileImageUploader({ user, onAvatarChange }: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputId = `file-input-${user.id}`;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // If a previous avatar exists and it's a Firebase Storage URL, delete it.
      if (user.avatarUrl && user.avatarUrl.includes('firebasestorage.googleapis.com')) {
        try {
          await deleteFile(user.avatarUrl);
        } catch (deleteError: any) {
          // Log a warning if deletion fails, but don't block the upload.
          // The old file might not exist, which is a common scenario.
          console.warn("Could not delete previous avatar, it might not exist in storage:", deleteError.message);
        }
      }
      
      const newAvatarUrl = await uploadFile(
        file,
        `avatars/${user.id}`,
        (progress) => {
          // You could show a progress bar here if desired
          console.log(`Upload is ${progress}% done`);
        }
      );

      onAvatarChange(newAvatarUrl);
      
    } catch (error: any) {
      console.error('Upload failed', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Could not upload your new profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group w-20 h-20">
      <Avatar className="h-20 w-20">
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback>
          <UserIcon className="h-10 w-10 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <label
        htmlFor={fileInputId}
        className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        ) : (
          <Edit className="h-6 w-6 text-white" />
        )}
      </label>
      <Input
        id={fileInputId}
        type="file"
        className="sr-only"
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/gif"
        disabled={isUploading}
      />
    </div>
  );
}
