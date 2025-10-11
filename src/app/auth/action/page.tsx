
import { Suspense } from 'react';
import ActionHandler from './action-handler';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActionHandlerPage() {
  return (
    <Suspense fallback={<div className="container flex items-center justify-center min-h-screen py-12"><Skeleton className="w-full max-w-md h-96" /></div>}>
      <ActionHandler />
    </Suspense>
  );
}
