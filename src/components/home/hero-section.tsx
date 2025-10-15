
'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';
import { Mouse } from 'lucide-react';

const HeroTabs = dynamic(() => import('./hero-tabs').then(mod => mod.HeroTabs), {
  ssr: false,
  loading: () => <Skeleton className="w-full max-w-3xl h-[172px] bg-white/10" />,
});


export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
        <Image
          src="https://wgl-dsites.net/genesisauto/wp-content/uploads/2024/05/h3-1.webp"
          alt="Hero background image of a car"
          fill
          className="object-cover"
          priority
          data-ai-hint="car"
        />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Find Your Next Car & Service
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl">
          The best way to find cars and services from local and trusted businesses.
        </p>
        <div className="mt-16 w-full max-w-3xl">
          <HeroTabs />
        </div>
      </div>
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white">
          <span className="text-sm tracking-widest uppercase">Scroll</span>
          <div className="relative h-10 w-6 rounded-full border-2 border-white">
              <div className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-white animate-scroll-down"></div>
          </div>
      </div>
    </section>
  );
}
