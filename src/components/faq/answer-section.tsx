
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Question, Answer } from '@/lib/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { addAnswer, toggleAnswerAccepted, voteOnAnswer } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';

type SerializableAnswer = Omit<Answer, 'createdAt'> & { createdAt: string };
type SerializableQuestion = Omit<Question, 'createdAt' | 'answers'> & {
  createdAt: string;
  answers: SerializableAnswer[];
};

type AnswerSectionProps = {
    question: SerializableQuestion;
    onAnswerChange: () => void;
}

export function AnswerSection({ question, onAnswerChange }: AnswerSectionProps) {
  const [yourAnswer, setYourAnswer] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
      setIsClient(true);
  }, []);

  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (a.accepted && !b.accepted) return -1;
    if (!a.accepted && b.accepted) return 1;
    if (a.votes !== b.votes) return b.votes - a.votes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });


  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to post an answer.',
        variant: 'destructive',
      });
      return;
    }

    if (!yourAnswer.trim()) {
      toast({
        title: 'Empty Answer',
        description: 'Please write an answer before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
        await addAnswer(question.id, yourAnswer);
        toast({
            title: 'Answer Submitted',
            description: 'Thank you for your contribution!',
        });
        setYourAnswer('');
        onAnswerChange();
    } catch(error: any) {
        console.error('Failed to submit answer:', error);
        toast({
            title: 'Error',
            description: 'Failed to submit your answer. Please try again.',
            variant: 'destructive',
        });
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || user.id !== question.authorId) {
        toast({
            title: 'Permission Denied',
            description: 'Only the author of the question can accept an answer.',
            variant: 'destructive',
        });
        return;
    }

    try {
        await toggleAnswerAccepted(question.id, answerId);
        toast({
            title: 'Answer Acceptance Updated',
            description: 'The accepted answer has been updated.',
        });
        onAnswerChange();
    } catch (error: any) {
        console.error('Failed to accept answer:', error);
        toast({
            title: 'Error',
            description: 'Failed to update the accepted answer. Please try again.',
            variant: 'destructive',
        });
    }
  };

  const handleVote = async (answerId: string, type: 'up' | 'down') => {
    if (!user) {
        toast({ title: "Login Required", description: "You must be logged in to vote.", variant: "destructive" });
        return;
    }

    try {
        await voteOnAnswer(question.id, answerId, user.id, type);
        onAnswerChange();
    } catch(e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <>
      <h3 className="text-xl font-bold mb-4">Answers ({question.answers.length})</h3>

      <div className="space-y-6">
        {sortedAnswers.map(answer => {
          const hasUpvoted = user && (answer.upvotedBy || []).includes(user.id);
          const hasDownvoted = user && (answer.downvotedBy || []).includes(user.id);
          return (
            <Card key={answer.id} className={answer.accepted ? "border-green-500" : ""}>
                <CardContent className="p-6 flex gap-4">
                    <div className="flex flex-col items-center text-center text-sm">
                         <Button variant="ghost" size="icon" onClick={() => handleVote(answer.id, 'up')} className={cn("h-auto p-2", hasUpvoted && 'text-primary')}>
                            <ThumbsUp className="h-6 w-6" />
                         </Button>
                        <span className="text-xl font-bold my-1">{answer.votes}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleVote(answer.id, 'down')} className={cn("h-auto p-2", hasDownvoted && 'text-destructive')}>
                            <ThumbsDown className="h-6 w-6" />
                        </Button>
                    </div>
                <div className="flex-1">
                    {answer.accepted && (
                    <div className="flex items-center text-green-600 mb-2">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Accepted Answer</span>
                    </div>
                    )}
                    <p className="text-muted-foreground">{answer.body}</p>
                    <div className="text-sm text-muted-foreground mt-4">
                        {isClient ? (
                            <span>By {answer.author} &bull; {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
                        ) : (
                            <span>By {answer.author} &bull; ...</span>
                        )}
                    </div>
                    {user && user.id === question.authorId && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3" 
                        onClick={() => handleAcceptAnswer(answer.id)}
                    >
                        {answer.accepted ? 'Unmark as Accepted' : 'Mark as Accepted'}
                    </Button>
                    )}
                </div>
                </CardContent>
            </Card>
            )
        })}
      </div>

      <Separator className="my-8" />
      
      <h3 className="text-xl font-bold mb-4">Your Answer</h3>
      {user ? (
        <form onSubmit={handleAnswerSubmit}>
            <Textarea
            placeholder="Write your answer..."
            rows={5}
            value={yourAnswer}
            onChange={(e) => setYourAnswer(e.target.value)}
            />
            <Button type="submit" className="mt-4">Post Your Answer</Button>
        </form>
      ) : (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">You must be logged in to post an answer.</p>
             <div className="mt-4 flex justify-center gap-4">
                <Button asChild>
                    <Link href={`/login?redirect=/forum/${question.id}`}>Login</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/register">Register</Link>
                </Button>
            </div>
        </div>
      )}
    </>
  );
}
