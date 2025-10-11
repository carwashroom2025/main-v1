

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getBlogPosts } from '@/lib/firebase/firestore';
import type { BlogPost } from '@/lib/types';
import { BlogCard } from '@/components/blog/blog-card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

const POSTS_PER_PAGE = 5;

export default function BlogListings() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const sortBy = searchParams.get('sort') || 'latest';

  const fetchPosts = async () => {
    setLoading(true);
    const posts = await getBlogPosts({ category, tag });
    setBlogPosts(posts);
    setLoading(false);
  }

  useEffect(() => {
    fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, tag]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, tag, sortBy])

  const filteredPosts = blogPosts
    .filter(post => {
      const searchMatch = searchTerm === '' ||
                          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    })
    .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (sortBy === 'oldest') {
            return dateA - dateB;
        }
        return dateB - dateA; // latest (default)
    });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };


  if (loading) {
    return (
        <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-6">
                    <Skeleton className="h-48 w-1/3" />
                    <div className="w-2/3 space-y-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            ))}
        </div>
    )
  }


  return (
    <>
      {currentPosts.length > 0 ? (
        <div className="space-y-8">
            {currentPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} priority={index < 2} />
            ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Posts Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or category filters.</p>
        </div>
      )}


      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
