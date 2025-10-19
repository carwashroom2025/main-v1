
'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, ArrowLeft, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Question, Answer } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnswerSection } from '@/components/faq/answer-section';
import { formatDistanceToNow } from 'date-fns';
import { voteOnQuestion, getQuestionWithoutIncrementingViews, deleteQuestion } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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


export function QuestionDetails({ initialQuestion }: { initialQuestion: SerializableQuestion }) {
  const [question, setQuestion] = useState(initialQuestion);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setQuestion(initialQuestion);
  }, [initialQuestion]);
  
  const refreshQuestion = async () => {
    const updatedQuestionData = await getQuestionWithoutIncrementingViews(initialQuestion.id);
    if (updatedQuestionData) {
       const serializableQuestion = {
        ...updatedQuestionData,
        createdAt: updatedQuestionData.createdAt.toDate().toISOString(),
        answers: updatedQuestionData.answers.map(answer => ({
          ...answer,
          createdAt: answer.createdAt.toDate().toISOString()
        }))
      };
      setQuestion(serializableQuestion as any);
    }
  }


  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
        router.push(`/login?redirect=/forum/${question.id}`);
        return;
    }

    try {
        await voteOnQuestion(question.id, user.id, type);
        refreshQuestion();
    } catch(e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to delete a question.", variant: "destructive" });
        return;
    }
    try {
        await deleteQuestion(question.id);
        toast({
            title: "Question Deleted",
            description: "The question has been successfully deleted.",
        });
        router.push('/forum');
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Could not delete the question.",
            variant: "destructive",
        });
    } finally {
        setIsAlertOpen(false);
    }
  };

  const hasUpvoted = user && (question.upvotedBy || []).includes(user.id);
  const hasDownvoted = user && (question.downvotedBy || []).includes(user.id);
  const canDelete = user && (user.id === question.authorId || ['Moderator', 'Administrator'].includes(user.role));

  return (
    <>
    <div className="container py-12 md:py-16 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
            <Link href="/forum" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to questions
            </Link>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{question.title}</h2>
            <p className="text-muted-foreground mb-4">{question.body}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map(tag => (
                <Badge key={tag} variant="secondary">#{tag}</Badge>
              ))}
            </div>
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                {isClient ? (
                    <span>Asked by <span className="font-medium text-foreground">{question.author}</span> {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })} &bull; {question.views} views</span>
                ) : (
                    <span>Asked by <span className="font-medium text-foreground">{question.author}</span>... &bull; {question.views} views</span>
                )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleVote('up')} className={cn("h-8 w-8", hasUpvoted && 'text-primary')}>
                            <ThumbsUp className="h-5 w-5" />
                        </Button>
                        <span className="font-medium">{question.upvotes || 0}</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleVote('down')} className={cn("h-8 w-8", hasDownvoted && 'text-destructive')}>
                            <ThumbsDown className="h-5 w-5" />
                        </Button>
                        <span className="font-medium">{question.downvotes || 0}</span>
                    </div>
                </div>
            </div>
             {canDelete && (
                <div className="mt-4">
                    <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setIsAlertOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Question
                    </Button>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AnswerSection question={question} onAnswerChange={refreshQuestion} />
    </div>

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this question and all of its answers.
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
