

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
import { ImageIcon, ArrowRight } from 'lucide-react';

function SidebarCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                    <span className="w-1 h-5 bg-destructive mr-3"></span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}


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
                const [allPosts, popular] = await Promise.all([
                    getBlogPosts(),
                    getPopularTags(8),
                ]);
                setPosts(allPosts);
                const sortedRecent = [...allPosts].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setRecentPosts(sortedRecent);
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
            <SidebarCard title="Categories">
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
                                "w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors text-muted-foreground hover:bg-muted/50",
                                !currentCategory && !currentTag ? "bg-primary/10 text-primary font-semibold" : ""
                            )}
                        >
                            <span>All Categories</span>
                            <Badge variant={!currentCategory && !currentTag ? "destructive" : "secondary"}>{getCategoryCount('all')}</Badge>
                        </button>
                        {categories.map(catName => (
                            <button
                                key={catName}
                                onClick={() => handleFilterClick('category', catName)}
                                className={cn(
                                    "w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors text-muted-foreground hover:bg-muted/50",
                                    currentCategory === catName ? "bg-primary/10 text-primary font-semibold" : ""
                                )}
                            >
                                <span>{catName}</span>
                                <Badge variant={currentCategory === catName ? "destructive" : "secondary"}>{getCategoryCount(catName)}</Badge>
                            </button>
                        ))}
                    </div>
                )}
            </SidebarCard>

            <SidebarCard title="Popular Tags">
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
                                variant={currentTag === tag ? "destructive" : "secondary"}
                                onClick={() => handleFilterClick('tag', tag)}
                                className="cursor-pointer hover:bg-primary/80"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </SidebarCard>

             <SidebarCard title="Trending Now">
                {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.slice(0,3).map((post, index) => (
                           <div key={post.id} className="flex items-start gap-4">
                                <span className="text-3xl font-bold text-muted-foreground w-8 text-center">#{index + 1}</span>
                                <div className="flex-1">
                                    <Link href={`/blog/${post.slug}`} scroll={false}>
                                        <h4 className="font-semibold leading-tight hover:text-primary">{post.title}</h4>
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-1">{post.views || 0} views</p>
                                </div>
                           </div>
                        ))}
                    </div>
                )}
            </SidebarCard>
        </div>
    )
}
