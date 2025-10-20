
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
        <h2 className="text-3xl md:text-4xl text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>Find Your</h2>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl uppercase">
          Next Cars & Services
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl">
          The best way to find cars and services from local and trusted businesses.
        </p>
        <div className="mt-12 w-full max-w-4xl">
          <HeroTabs />
           <div className="mt-8 text-center">
                <p className="font-display text-2xl text-white">
                    Or browse the selected categories
                </p>
                 <svg 
                    className="mx-auto mt-2 h-auto w-16 text-destructive"
                    viewBox="0 0 64 64" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                 >
                    <path 
                        d="M32 54C42.8 54 54 42.8 54 32C54 21.2 42.8 10 32 10C21.2 10 10 21.2 10 32C10 38.9333 13.9333 46.8 20 50" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                    />
                    <path d="M24 45L20 50L15 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
      </div>
    </section>
  );
}
