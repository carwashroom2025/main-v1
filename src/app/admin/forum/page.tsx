
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getQuestions } from '@/lib/firebase/firestore';
import type { Question } from '@/lib/types';
import { FaqTable } from '@/components/admin/faq-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageForumPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = async () => {
        setLoading(true);
        const { questions: questionsFromDb } = await getQuestions();
        setQuestions(questionsFromDb);
        setLoading(false);
    }

    useEffect(() => {
        fetchQuestions();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Forum</CardTitle>
                <CardDescription>
                Create, edit, or delete forum questions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <FaqTable questions={questions} onDataChange={fetchQuestions} />
                )}
            </CardContent>
        </Card>
    );
}
