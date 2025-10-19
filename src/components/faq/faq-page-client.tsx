

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbsUp, Eye, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';
import type { Question } from '@/lib/types';
import { getQuestions } from '@/lib/firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { AskQuestion } from '@/components/faq/ask-question';
import { useAuth } from '@/context/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from '@/components/ui/pagination';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const QUESTIONS_PER_PAGE = 10;

export function FaqPageClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('q') || '';
  const activeTab = searchParams.get('tab') || 'Newest';

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const { questions: questionsFromDb, totalCount: count } = await getQuestions({
      page: currentPage,
      limit: QUESTIONS_PER_PAGE,
      sortBy: activeTab as any,
    });
    setQuestions(questionsFromDb);
    setTotalCount(count);
    setLoading(false);
  }, [currentPage, activeTab]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const updateURL = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
        params.set(key, value);
    } else {
        params.delete(key);
    }
    if (key !== 'page') {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`);
  }
  
  const handleTabChange = (tab: string) => {
    updateURL('tab', tab);
  };
  
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const newSearchTerm = (e.target as any).search.value;
      updateURL('q', newSearchTerm);
  }

  const handlePageChange = (page: number) => {
    updateURL('page', page.toString());
  };

  const totalPages = Math.ceil(totalCount / QUESTIONS_PER_PAGE);

  // Client-side filtering until server-side search is implemented
  const displayedQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const pageTitle = activeTab === 'TopAnswers' ? "Top Answered Questions" : activeTab === 'TopRated' ? "Top Rated Questions" : "All Questions";

  return (
    <div className="container py-12 md:py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">{pageTitle}</h2>
            <p className="text-muted-foreground text-lg">{totalCount} questions</p>
        </div>
        <div className="flex items-center gap-4">
          {user && <AskQuestion onQuestionAdded={fetchQuestions} />}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="Newest">Newest</TabsTrigger>
              <TabsTrigger value="TopAnswers">Top Answers</TabsTrigger>
              <TabsTrigger value="TopRated">Top Rated</TabsTrigger>
              <TabsTrigger value="Oldest">Oldest</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <form onSubmit={handleSearch} className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            name="search"
            placeholder="Search questions..." 
            className="pl-10"
            defaultValue={searchTerm}
        />
      </form>

      <div className="space-y-4">
        {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
            ))
        ) : displayedQuestions.map((q) => {
            const displayedTags = q.tags.slice(0, 3);
            const remainingTagsCount = q.tags.length - 3;
            return (
                <div key={q.id} className="flex items-start gap-4 rounded-lg border bg-card p-4">
                    <Avatar>
                        <AvatarImage src={q.authorAvatarUrl} alt={q.author} />
                        <AvatarFallback>{q.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-grow">
                        <div className="flex-grow">
                            <Link href={`/forum/${q.id}`} className="hover:text-primary transition-colors">
                                <h3 className="font-semibold text-lg">{q.title}</h3>
                            </Link>
                            <div className="text-sm text-muted-foreground mt-1">
                                Asked by <span className="font-medium text-foreground">{q.author}</span>
                                <span className="italic"> &bull; {formatDistanceToNow(q.createdAt.toDate(), { addSuffix: true })}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mt-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {displayedTags.map(tag => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                                {remainingTagsCount > 0 && (
                                    <Badge variant="secondary">+{remainingTagsCount} more</Badge>
                                )}
                            </div>
                             <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                                <span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4 text-destructive" /> {q.upvotes || 0}</span>
                                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-destructive" /> {q.views || 0} views</span>
                                <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-destructive" /> {q.answers.length} answers</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
            <Pagination>
                <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                    />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                    <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                    >
                        {page}
                    </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
                    />
                </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
      )}
    </div>
  );
}
