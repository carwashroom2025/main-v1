
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getBlogPosts } from '@/lib/firebase/firestore';
import type { BlogPost } from '@/lib/types';
import { BlogTable } from '@/components/admin/blog-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        const postsFromDb = await getBlogPosts();
        setPosts(postsFromDb);
        setLoading(false);
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Blog Posts</CardTitle>
                <CardDescription>
                Create, edit, or delete blog posts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <BlogTable posts={posts} onDataChange={fetchPosts} />
                )}
            </CardContent>
        </Card>
    );
}
