
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
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop' }}
            >
                <svg
                    className="h-10 w-10 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M12 5v14" />
                    <path d="m19 12-7 7-7-7" />
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
