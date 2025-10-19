
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const carImage = PlaceHolderImages.find(img => img.id === '404-car');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('search') as string;
    if (searchTerm.trim()) {
      router.push(`/services?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="relative w-full max-w-2xl">
        <h1 className="absolute inset-x-0 top-0 z-10 -mt-4 text-[15rem] font-black leading-none text-destructive md:-mt-8 md:text-[20rem]">
          404
        </h1>
        {carImage && (
          <div className="relative z-0 mx-auto mt-24 w-full md:mt-20">
            <Image
              src={carImage.imageUrl}
              alt="White sports car"
              width={800}
              height={450}
              className="object-contain"
              data-ai-hint={carImage.imageHint}
            />
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold uppercase tracking-wider md:text-3xl">
          404 Auto-Drive: U-Turn Required
        </h2>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for was moved, removed, renamed or never existed.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative mt-8 w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          type="search"
          placeholder="Search..."
          className="h-12 rounded-full border-2 pl-10"
        />
      </form>

      <div className="mt-12">
        <Button asChild size="lg" className="h-24 w-24 rounded-full text-center leading-tight">
          <Link href="/">
            Back To Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
