
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

type RelatedPostsProps = {
    posts: BlogPost[];
};

export function RelatedPosts({ posts }: RelatedPostsProps) {
    if (posts.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8">
             <h2 className="text-2xl font-bold">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.map(post => {
                    return (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                        <Card className="h-full overflow-hidden">
                            <div className="relative aspect-video bg-muted flex items-center justify-center">
                                {post.imageUrl ? (
                                    <Image src={post.imageUrl} alt={post.title} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                )}
                            </div>
                            <CardContent className="p-4">
                                <h4 className="font-semibold leading-tight group-hover:text-primary">{post.title}</h4>
                                <p className="text-sm text-muted-foreground mt-2">{format(new Date(post.date), 'MMMM d, yyyy')}</p>
                            </CardContent>
                        </Card>
                    </Link>
                )})}
            </div>
        </div>
    )
}

    