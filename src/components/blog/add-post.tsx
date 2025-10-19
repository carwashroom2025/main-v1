
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { BlogPostForm } from '@/components/admin/blog-post-form';
import { PlusCircle } from 'lucide-react';

type AddPostProps = {
    onPostAdded: () => void;
};

export function AddPost({ onPostAdded }: AddPostProps) {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    if (loading || !isClient) {
        return <Button disabled className="w-32 h-10 animate-pulse"></Button>;
    }
    
    const canAddPost = user && ['Author', 'Moderator', 'Administrator'].includes(user.role);

    if (!canAddPost) {
        return null;
    }

    const handleAddPostClick = () => {
        setIsFormOpen(true);
    };

    const handleDataChange = () => {
        onPostAdded();
        toast({
            title: "Post Added",
            description: "Your new blog post has been successfully created.",
        });
    }

    return (
        <>
            <Button onClick={handleAddPostClick} className="rounded-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Post
            </Button>

            <BlogPostForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                post={null}
                onDataChange={handleDataChange}
            />
        </>
    );
}
