
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Question, Answer } from '@/lib/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { addAnswer, toggleAnswerAccepted, voteOnAnswer, deleteAnswer } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [answerToDelete, setAnswerToDelete] = useState<Answer | null>(null);
  const router = useRouter();


  useEffect(() => {
      setIsClient(true);
  }, []);

  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (a.accepted && !b.accepted) return -1;
    if (!a.accepted && b.accepted) return 1;
    if (a.upvotes - a.downvotes !== b.upvotes - b.downvotes) return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });


  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/forum/${question.id}`);
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
    if (!user) {
        router.push(`/login?redirect=/forum/${question.id}`);
        return;
    }

    if (user.id !== question.authorId && !['Moderator', 'Administrator', 'Author'].includes(user.role)) {
        toast({
            title: 'Permission Denied',
            description: 'Only the question author or a moderator can accept an answer.',
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
        router.push(`/login?redirect=/forum/${question.id}`);
        return;
    }

    try {
        await voteOnAnswer(question.id, answerId, user.id, type);
        onAnswerChange();
    } catch(e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };
  
  const handleDeleteClick = (answer: Answer) => {
    if (!user) {
        router.push(`/login?redirect=/forum/${question.id}`);
        return;
    }
    setAnswerToDelete(answer);
    setIsAlertOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!answerToDelete) return;
    try {
        await deleteAnswer(question.id, answerToDelete.id);
        toast({
            title: "Answer Deleted",
            description: "The answer has been successfully deleted.",
        });
        onAnswerChange();
    } catch (error: any) {
        console.error("Failed to delete answer:", error);
        toast({
            title: "Error",
            description: error.message || "Failed to delete answer.",
            variant: "destructive",
        });
    } finally {
        setIsAlertOpen(false);
        setAnswerToDelete(null);
    }
  }


  return (
    <>
      <h3 className="text-xl font-bold mb-4">Answers ({question.answers.length})</h3>

      <div className="space-y-6">
        {sortedAnswers.map(answer => {
          const hasUpvoted = user && (answer.upvotedBy || []).includes(user.id);
          const hasDownvoted = user && (answer.downvotedBy || []).includes(user.id);
          const canAccept = user && (user.id === question.authorId || ['Moderator', 'Administrator', 'Author'].includes(user.role));
          const canDelete = user && (user.id === answer.authorId || ['Moderator', 'Administrator'].includes(user.role));

          return (
            <Card key={answer.id} className={answer.accepted ? "border-green-500" : ""}>
                <CardContent className="p-6">
                    {answer.accepted && (
                    <div className="flex items-center text-green-600 mb-2">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Accepted Answer</span>
                    </div>
                    )}
                    <p className="text-muted-foreground">{answer.body}</p>
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                            {isClient ? (
                                <span>By {answer.author} &bull; {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
                            ) : (
                                <span>By {answer.author} &bull; ...</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => handleVote(answer.id, 'up')} className={cn("h-8 w-8", hasUpvoted && 'text-primary')}>
                                <ThumbsUp className="h-5 w-5" />
                            </Button>
                            <span className="font-medium">{answer.upvotes || 0}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleVote(answer.id, 'down')} className={cn("h-8 w-8", hasDownvoted && 'text-destructive')}>
                                <ThumbsDown className="h-5 w-5" />
                            </Button>
                            <span className="font-medium">{answer.downvotes || 0}</span>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 mt-2">
                        {canAccept && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAcceptAnswer(answer.id)}
                        >
                            {answer.accepted ? 'Unmark as Accepted' : 'Mark as Accepted'}
                        </Button>
                        )}
                        {canDelete && (
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(answer)}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
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
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this answer.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
