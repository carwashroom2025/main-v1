
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getRecentBlogPosts, getBlogPosts, getPopularTags } from '@/lib/firebase/firestore';
import type { BlogPost } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

export function BlogSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [popularTags, setPopularTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [recent, allPosts, popular] = await Promise.all([
                    getRecentBlogPosts(3), 
                    getBlogPosts(),
                    getPopularTags(5),
                ]);
                setRecentPosts(recent);
                setPosts(allPosts);
                setPopularTags(popular);
                
                const usedCategoryNames = [...new Set(allPosts.map(p => p.category))].sort();
                setCategories(usedCategoryNames);

            } catch (error) {
                console.error("Failed to fetch sidebar data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    
    const handleFilterClick = (type: 'category' | 'tag', value: string) => {
        const params = new URLSearchParams(searchParams);
        const currentFilter = params.get(type);

        // If clicking the currently active filter, remove it. Otherwise, set it.
        if (currentFilter === value) {
            params.delete(type);
        } else {
             // Clear other filters when one is selected
            params.delete('category');
            params.delete('tag');
            if (value !== 'all') {
                params.set(type, value);
            }
        }
        
        router.push(`/blog?${params.toString()}`);
    }

    const currentCategory = searchParams.get('category');
    const currentTag = searchParams.get('tag');
    
    const getCategoryCount = (categoryName: string) => {
        if (categoryName === 'all') return posts.length;
        return posts.filter(post => post.category === categoryName).length;
    }


    return (
        <div className="sticky top-24 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-3">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-3/4" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                           <button 
                                onClick={() => handleFilterClick('category', 'all')}
                                className={cn(
                                    "w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors",
                                    !currentCategory && !currentTag ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent"
                                )}
                            >
                                <span>All Categories</span>
                                <Badge variant={!currentCategory && !currentTag ? "default" : "secondary"}>{getCategoryCount('all')}</Badge>
                            </button>
                            {categories.map(catName => (
                                <button
                                    key={catName}
                                    onClick={() => handleFilterClick('category', catName)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors",
                                        currentCategory === catName ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent"
                                    )}
                                >
                                    <span>{catName}</span>
                                    <Badge variant={currentCategory === catName ? "default" : "secondary"}>{getCategoryCount(catName)}</Badge>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                             <Skeleton className="h-16 w-full" />
                             <Skeleton className="h-16 w-full" />
                             <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentPosts.map(post => {
                                return (
                                <Link key={post.id} href={`/blog/${post.slug}`} scroll={false} className="group flex items-center gap-4">
                                     <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                        {post.imageUrl ? (
                                            <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        )}
                                     </div>
                                     <div>
                                        <h4 className="font-semibold leading-tight group-hover:text-primary">{post.title}</h4>
                                        <p className="text-sm text-muted-foreground">{format(new Date(post.date), 'MMMM d, yyyy')}</p>
                                     </div>
                                </Link>
                            )})}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map(tag => (
                                <Badge 
                                    key={tag}
                                    variant={currentTag === tag ? "default" : "secondary"}
                                    onClick={() => handleFilterClick('tag', tag)}
                                    className="cursor-pointer hover:bg-accent"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

    
