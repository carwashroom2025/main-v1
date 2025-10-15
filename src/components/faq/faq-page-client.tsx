
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
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

const QUESTIONS_PER_PAGE = 10;

export function FaqPageClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  const fetchQuestions = async () => {
    setLoading(true);
    const questionsFromDb = await getQuestions();
    setQuestions(questionsFromDb);
    setLoading(false);
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleQuestionAdded = async () => {
    // Refetch questions after a new one is added
    fetchQuestions();
  };

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.body.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedAndFilteredQuestions = [...filteredQuestions].sort((a, b) => {
    switch(activeTab) {
        case 'Oldest':
            return a.createdAt.toMillis() - b.createdAt.toMillis();
        case 'Newest':
        default:
            return b.createdAt.toMillis() - a.createdAt.toMillis();
    }
  }).filter(q => {
    switch(activeTab) {
        case 'Answered':
            return q.answers.length > 0;
        case 'Unanswered':
            return q.answers.length === 0;
        default:
            return true;
    }
  });

  const totalPages = Math.ceil(sortedAndFilteredQuestions.length / QUESTIONS_PER_PAGE);

  const currentQuestions = sortedAndFilteredQuestions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  return (
    <div className="container py-12 md:py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">All Questions</h2>
            {!loading && <p className="text-muted-foreground text-lg">{questions.length} questions</p>}
        </div>
        <div className="flex items-center gap-4">
          {user && <AskQuestion onQuestionAdded={handleQuestionAdded} />}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="Newest">Newest</TabsTrigger>
              <TabsTrigger value="Oldest">Oldest</TabsTrigger>
              <TabsTrigger value="Answered">Answered</TabsTrigger>
              <TabsTrigger value="Unanswered">Unanswered</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
            placeholder="Search questions..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
            ))
        ) : currentQuestions.map((q) => (
            <Card key={q.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl">
                        <Link href={`/forum/${q.id}`} className="hover:text-primary transition-colors">
                            {q.title}
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-2">{q.body}</p>
                     <div className="flex flex-wrap gap-2 mt-4">
                        {q.tags.map(tag => (
                            <Badge key={tag} variant="secondary">#{tag}</Badge>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                    <div className="flex justify-between w-full text-sm text-muted-foreground">
                        <div className="flex gap-4">
                            <span>{q.votes} votes</span>
                            <span className={q.answers.some(a => a.accepted) ? 'text-green-600' : ''}>
                                {q.answers.length} answers
                            </span>
                            <span>{q.views} views</span>
                        </div>
                    </div>
                     <div className="text-sm text-muted-foreground text-right w-full">
                        <p>asked {formatDistanceToNow(q.createdAt.toDate(), { addSuffix: true })}</p>
                        <p>by <span className="font-medium text-foreground">{q.author}</span></p>
                    </div>
                </CardFooter>
            </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
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
    </div>
  );
}
