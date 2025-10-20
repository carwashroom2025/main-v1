
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
           <div className="mt-8 flex justify-center items-center gap-4">
                <svg className="h-16 w-16 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <style>
                    {`
                      .arrow-path {
                        stroke-dasharray: 200;
                        stroke-dashoffset: 200;
                        animation: draw-arrow 2s ease-out forwards;
                      }
                      .arrow-head {
                        animation: pulse-head 2s infinite ease-in-out 2s;
                      }
                      @keyframes draw-arrow {
                        to {
                          stroke-dashoffset: 0;
                        }
                      }
                      @keyframes pulse-head {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.8; }
                      }
                    `}
                  </style>
                  <g className="arrow-head" style={{ transformOrigin: '71.6667px 85px' }}>
                    <path d="M71.6667 85V56.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M60 73.3333L71.6667 85L83.3333 73.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <path className="arrow-path" d="M36.6667 21.6667C30 35 44.1667 60 70.8333 60C97.5 60 81.6667 35 71.6667 21.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="font-display text-2xl text-white">
                    Or browse the selected categories
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}
