
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
        <div className="relative">
            <h2 className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl md:text-7xl text-primary z-10 whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>Find Your</h2>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl uppercase">
            Next Cars & Services
            </h1>
        </div>
        <p className="mt-4 max-w-2xl text-lg md:text-xl">
          The best way to find cars and services from local and trusted businesses.
        </p>
        <div className="mt-12 w-full max-w-4xl">
          <HeroTabs />
            <motion.div
                className="mt-20 flex justify-center items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                <svg
                    className="h-16 w-16 text-white"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                    d="M25 25 C 40 70, 60 70, 75 25"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="arrow-path-simple"
                    />
                    <path
                    d="M70 20 L 75 25 L 80 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="arrow-head-simple"
                    />
                </svg>
                <p className="text-4xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                    Or browse the selected categories
                </p>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
