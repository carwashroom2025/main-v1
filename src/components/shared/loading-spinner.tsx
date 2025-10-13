
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-full w-full animate-spin-slow rounded-full border-4 border-dashed border-primary/50"></div>
            <Car className="h-8 w-8 animate-pulse text-primary" />
        </div>
    </div>
  );
}
