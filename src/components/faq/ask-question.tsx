
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import type { Question } from '@/lib/types';
import Link from 'next/link';
import { addQuestion } from '@/lib/firebase/firestore';

type AskQuestionProps = {
    onQuestionAdded?: () => void;
}

export function AskQuestion({ onQuestionAdded }: AskQuestionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: 'Not Logged In',
                description: 'You need to be logged in to ask a question.',
                variant: 'destructive',
            });
            return;
        }

        if (!title || !body) {
            toast({
                title: 'Incomplete Question',
                description: 'Please provide a title and a body for your question.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const questionData = {
                title,
                body,
                tags: tags.split(',').map(t => t.trim()).filter(t => t),
                authorId: user.id
            };
            // The type assertion is complex, so we build the object and let TS infer it.
            // Firestore function will add the rest of the fields.
            await addQuestion(questionData as any);

            toast({
                title: 'Question Submitted',
                description: 'Your question has been posted.',
            });
            
            if (onQuestionAdded) {
                onQuestionAdded();
            }
            
            setIsOpen(false);
            setTitle('');
            setBody('');
            setTags('');

        } catch (error: any) {
            console.error("Failed to add question:", error);
            toast({
                title: 'Error',
                description: 'Failed to submit your question. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Ask a Question</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                {!user ? (
                     <>
                        <DialogHeader>
                            <DialogTitle>Login Required</DialogTitle>
                            <DialogDescription>
                                You need to be logged in to ask a question.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center">
                            <Button asChild><Link href="/login">Login</Link></Button>
                            <Button asChild variant="outline"><Link href="/register">Register</Link></Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Ask a Public Question</DialogTitle>
                            <DialogDescription>
                                Get answers from the community.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input 
                                    id="title" 
                                    placeholder="e.g., Is it safe to use synthetic oil in an older car?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">Body</Label>
                                <Textarea 
                                    id="body" 
                                    placeholder="Include all the information someone would need to answer your question."
                                    rows={6}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <Input 
                                    id="tags" 
                                    placeholder="e.g., oil-change, maintenance, engine (comma-separated)"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Posting...' : 'Post Your Question'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
