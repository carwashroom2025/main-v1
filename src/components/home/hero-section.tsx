
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

const HeroTabs = dynamic(() => import('./hero-tabs').then(mod => mod.HeroTabs), {
  ssr: false,
  loading: () => <Skeleton className="w-full max-w-3xl h-[88px] bg-white/10" />,
});


export function Hero() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
        <h2 className="text-3xl md:text-4xl font-headline text-primary mb-2" style={{ fontFamily: "'Dancing Script', cursive" }}>Find Your Next Car & Service</h2>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl uppercase">
          Find Your Next Car & Service
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl">
          The best way to find cars and services from local and trusted businesses.
        </p>
        <div className="mt-12 w-full max-w-4xl">
          <HeroTabs />
        </div>
      </div>
      <div className={cn(
        "absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white transition-opacity duration-500",
        scrolled ? "opacity-0" : "opacity-100"
      )}>
          <span className="text-sm tracking-widest uppercase">Scroll</span>
          <div className="relative h-10 w-6 rounded-full border-2 border-white">
              <div className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-white animate-scroll-down"></div>
          </div>
      </div>
    </section>
  );
}
