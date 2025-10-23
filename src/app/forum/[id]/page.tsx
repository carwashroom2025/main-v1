
import { notFound } from 'next/navigation';
import { getQuestion } from '@/lib/firebase/firestore';
import { QuestionDetails } from './question-details';
import type { Question } from '@/lib/types';

export const revalidate = 60;

export default async function QandAPage({ params }: { params: { id: string } }) {
    const question = await getQuestion(params.id);

    if (!question) {
        notFound();
    }

    const serializableQuestion = {
      ...question,
      createdAt: question.createdAt.toDate().toISOString(),
      answers: question.answers.map(answer => ({
        ...answer,
        createdAt: answer.createdAt.toDate().toISOString()
      }))
    };

    return <QuestionDetails initialQuestion={serializableQuestion} />;
}
