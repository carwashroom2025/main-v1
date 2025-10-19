
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="relative w-full max-w-2xl">
        <h1 className="text-[15rem] font-black leading-none text-destructive md:text-[20rem]">
          404
        </h1>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold uppercase tracking-wider md:text-3xl">
          404 CARWASHROOM: U-TURN REQUIRED
        </h2>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for was moved, removed, renamed or never existed.
        </p>
      </div>

      <div className="mt-12">
        <Button asChild size="lg">
          <Link href="/">
            Back To Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
