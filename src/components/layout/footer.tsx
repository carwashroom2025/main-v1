
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronUp, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Footer() {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;

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
  }, [isClient]);

  const scrollToTop = () => {
    if (!isClient) return;
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <footer className="relative border-t bg-card text-card-foreground overflow-hidden">
        <div className="container py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-wider">
                Unleash The Road Ahead;<br/> Your Next Car Awaits
              </h3>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">+1 234 567 890</p>
                <p className="text-xl text-primary">contact@carwashroom.com</p>
                <p className="flex items-center text-muted-foreground"><MapPin className="h-5 w-5 mr-2 text-primary"/>27 Division St, New York, NY 10002, USA</p>
              </div>
              <div className="flex space-x-6 items-center">
                <Link href="#" className="flex items-center text-muted-foreground hover:text-primary">
                  <ArrowRight className="h-4 w-4 mr-2" /> INSTAGRAM
                </Link>
                <Link href="#" className="flex items-center text-muted-foreground hover:text-primary">
                  <ArrowRight className="h-4 w-4 mr-2" /> FACEBOOK
                </Link>
                <Link href="#" className="flex items-center text-muted-foreground hover:text-primary">
                  <ArrowRight className="h-4 w-4 mr-2" /> TWITTER
                </Link>
                <Link href="#" className="flex items-center text-muted-foreground hover:text-primary">
                  <ArrowRight className="h-4 w-4 mr-2" /> LINKEDIN
                </Link>
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

            <div className="md:col-span-2 space-y-4">
              <h4 className="font-bold text-lg">Quick Links</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/cars" className="hover:text-primary">Cars</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQs</Link></li>
                <li><Link href="/services" className="hover:text-primary">Services</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
            {isClient && (
              <>
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
              </>
            )}
          </div>
        </div>
        <div 
          className="absolute inset-0 z-0 text-[180px] font-black uppercase text-foreground/5 flex items-center select-none pointer-events-none whitespace-nowrap"
          style={{ letterSpacing: '0.2em' }}
        >
          <div className="animate-marquee flex w-max">
            <span className="mx-4 flex-shrink-0">Carwashroom</span>
            <span className="mx-4 flex-shrink-0">Carwashroom</span>
          </div>
        </div>
      </footer>
      {isClient && isVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button onClick={scrollToTop} size="icon" className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90">
              <ChevronUp className="h-8 w-8" />
          </Button>
        </div>
      )}
    </>
  );
}
