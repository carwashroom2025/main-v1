
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronUp, MapPin, X, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';

// A simple SVG icon for TikTok since it's not in lucide-react
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 4h4v4" />
        <path d="M12 20v-9" />
        <path d="M8 20v-9" />
        <path d="M20 8c0-4.4-3.6-8-8-8S4 3.6 4 8c0 2.4 1.1 4.5 2.8 5.9L4 20h8l-2.8-6.1c.5-.1.9-.2 1.4-.2 4.4 0 8-3.6 8-8Z" />
    </svg>
);


function ClientFooterContent() {
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      const toggleVisibility = () => {
        if (window.scrollY > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      };
  
      window.addEventListener('scroll', toggleVisibility);
      toggleVisibility(); // Set initial state
  
      return () => {
        window.removeEventListener('scroll', toggleVisibility);
      };
    }, []);
  
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };
  
    return (
      <>
        <div className="md:col-span-5 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-wider">
            Unleash The Road Ahead;<br/> Your Next Car Awaits
            </h3>
            <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">0552405099</p>
                <p className="text-xl text-primary">ask@carwashroom.net</p>
                <div className="flex items-start text-muted-foreground pt-2">
                    <MapPin className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-1"/>
                    <span>202 Delma House Building, King Faisal Street, Sharjah, UAE</span>
                </div>
            </div>
            <div className="flex space-x-2 items-center">
                <Button variant="ghost" asChild>
                  <Link href="#" className="text-muted-foreground hover:text-[#E4405F]"><Instagram className="h-5 w-5" /> Instagram</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="#" className="text-muted-foreground hover:text-[#1877F2]"><Facebook className="h-5 w-5" /> Facebook</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="#" className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /> X</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="#" className="text-muted-foreground hover:text-[#000000] dark:hover:text-white"><TikTokIcon className="h-5 w-5" /> TikTok</Link>
                </Button>
                 <Button variant="ghost" asChild>
                  <Link href="#" className="text-muted-foreground hover:text-[#FF0000]"><Youtube className="h-5 w-5" /> YouTube</Link>
                </Button>
            </div>
        </div>

        <div className="md:col-span-1"></div>

        <div className="md:col-span-2 space-y-4">
          <h4 className="font-bold text-lg">Carwashroom</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">About Company</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
          </ul>
        </div>
        
        <div className="md:col-span-4"></div>

        <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground md:col-span-12">
            <p>&copy; {new Date().getFullYear()} Carwashroom. All rights reserved.</p>
            <p className="mt-2">
                Made with ❤️ by{' '}
                <a
                    href="https://codeuxe.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                >
                    Codeuxe
                </a>
            </p>
        </div>

        {isVisible && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button onClick={scrollToTop} size="icon" className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90">
                <ChevronUp className="h-8 w-8" />
            </Button>
          </div>
        )}
      </>
    );
  }

export function Footer() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
      <footer className="relative border-t bg-card text-card-foreground overflow-hidden">
        <div className="container py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {isClient ? <ClientFooterContent /> : null}
          </div>
        </div>
        {isClient && (
          <div 
            className="absolute inset-0 z-0 text-[180px] font-black uppercase text-foreground/5 flex items-center select-none pointer-events-none whitespace-nowrap"
            style={{ letterSpacing: '0.2em' }}
          >
            <div className="animate-marquee flex w-max">
              <span className="mx-4 flex-shrink-0">Carwashroom</span>
              <span className="mx-4 flex-shrink-0">Carwashroom</span>
            </div>
          </div>
        )}
      </footer>
  );
}
