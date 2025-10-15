
'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Question, Answer } from '@/lib/types';
import Link from 'next/link';
import { AnswerSection } from '@/components/faq/answer-section';
import { formatDistanceToNow } from 'date-fns';
import { getQuestion, voteOnQuestion, getQuestionWithoutIncrementingViews } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  const [showAllTags, setShowAllTags] = useState(false);

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
        toast({ title: "Login Required", description: "You must be logged in to vote.", variant: "destructive" });
        return;
    }

    try {
        await voteOnQuestion(question.id, user.id, type);
        refreshQuestion();
    } catch(e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const hasUpvoted = user && (question.upvotedBy || []).includes(user.id);
  const hasDownvoted = user && (question.downvotedBy || []).includes(user.id);
  
  const visibleTags = showAllTags ? question.tags : question.tags.slice(0, 4);
  const remainingTagsCount = question.tags.length - 4;

  return (
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
        <CardContent className="p-6 flex gap-4">
            <div className="flex flex-col items-center text-center text-sm">
                <Button variant="ghost" onClick={() => handleVote('up')} className={cn(hasUpvoted && 'text-primary')}>
                    <ArrowUp className="h-6 w-6" />
                </Button>
                <span className="text-2xl font-bold my-1">{question.votes}</span>
                 <Button variant="ghost" onClick={() => handleVote('down')} className={cn(hasDownvoted && 'text-destructive')}>
                    <ArrowDown className="h-6 w-6" />
                </Button>
            </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{question.title}</h2>
            <p className="text-muted-foreground mb-4">{question.body}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {visibleTags.map(tag => (
                <Badge key={tag} variant="secondary">#{tag}</Badge>
              ))}
              {remainingTagsCount > 0 && (
                <Badge 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => setShowAllTags(true)}
                >
                    +{remainingTagsCount} more
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {isClient ? (
                  <span>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })} &bull; {question.views} views</span>
              ) : (
                  <span>Asked... &bull; {question.views} views</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AnswerSection question={question} onAnswerChange={refreshQuestion} />
    </div>
  );
}
