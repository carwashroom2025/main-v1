
'use client';

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = (
  file: File,
  path: string,
  onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileRef = ref(storage, `${path}/${uuidv4()}-${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed with error:', error.code, error.message);
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
        } catch (error: any) {
            console.error('Failed to get download URL:', error);
            reject(new Error(`Could not get download URL: ${error.message}`));
        }
      }
    );
  });
};

export const deleteFile = async (fileUrl: string) => {
    if (!fileUrl) {
      console.warn("deleteFile called with an empty or undefined URL.");
      return;
    }
    
    if (!fileUrl.startsWith('gs://') && !fileUrl.startsWith('https://firebasestorage.googleapis.com')) {
        console.warn(`URL is not a Firebase Storage URL, skipping deletion: ${fileUrl}`);
        return;
    }

    try {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
    } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
            console.warn(`File not found, skipping deletion: ${fileUrl}`);
            return;
        }
        console.error("Error deleting file:", error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

export const listFiles = async (path: string): Promise<{ url: string; fullPath: string }[]> => {
    const listRef = ref(storage, path);
    try {
        const res = await listAll(listRef);
        const files = await Promise.all(
            res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return { url, fullPath: itemRef.fullPath };
            })
        );
        return files;
    } catch (error: any) {
        console.error("Error listing files:", error);
        throw new Error(`Failed to list files: ${error.message}`);
    }
};
