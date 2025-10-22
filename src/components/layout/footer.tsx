
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronUp, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { useEffect, useState } from 'react';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" fill="currentColor" {...props}>
        <g clipPath="url(#clip0_1_2)">
            <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
        </g>
        <defs>
            <clipPath id="clip0_1_2">
                <rect width="1200" height="1227" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);


const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg style={{enableBackground:"new 0 0 64 64"}} version="1.1" viewBox="0 0 64 64" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g>
            <path d="M58,19.4v9.3c-0.5,0-1.1,0.1-1.7,0.1c-4.5,0-8.7-1.7-11.9-4.4v19.8c0,4-1.3,7.8-3.6,10.8     c-3.2,4.3-8.4,7.2-14.3,7.2c-6.4,0-12-3.4-15.1-8.4c3.2,3,7.5,4.9,12.2,4.9c5.8,0,11-2.8,14.2-7.2c2.2-3,3.6-6.7,3.6-10.8V20.8     c3.2,2.8,7.3,4.4,11.9,4.4c0.6,0,1.1,0,1.7-0.1v-6c0.9,0.2,1.7,0.3,2.6,0.3H58z" fill="#FF004F"></path>
            <path d="M29,26.3v10.3c-0.7-0.2-1.5-0.3-2.2-0.3c-4.4,0-8,3.7-8,8.2c0,1,0.2,1.9,0.5,2.8c-2-1.5-3.4-3.9-3.4-6.6     c0-4.5,3.6-8.2,8-8.2c0.8,0,1.5,0.1,2.2,0.3l0-6.6c0.2,0,0.4,0,0.6,0C27.5,26.2,28.3,26.2,29,26.3z" fill="#FF004F"></path>
            <path d="M45.9,12c-1.8-1.6-3.1-3.8-3.8-6.1h2.4c0,0.5,0,0.9,0,1.4C44.7,8.9,45.2,10.5,45.9,12z" fill="#FF004F"></path>
        </g>
        <path d="M55.1,19.2v6c-0.5,0.1-1.1,0.1-1.7,0.1c-4.5,0-8.7-1.7-11.9-4.4v19.8c0,4-1.3,7.8-3.6,10.8c-3.3,4.4-8.4,7.2-14.2,7.2   c-4.7,0-9-1.9-12.2-4.9c-1.7-2.8-2.7-6-2.7-9.5c0-9.7,7.7-17.6,17.3-17.9l0,6.6c-0.7-0.2-1.5-0.3-2.2-0.3c-4.4,0-8,3.7-8,8.2   c0,2.7,1.3,5.2,3.4,6.6c1.1,3.1,4.1,5.4,7.5,5.4c4.4,0,8-3.7,8-8.2V5.9h7.3c0.7,2.4,2,4.5,3.8,6.1C47.7,15.6,51.1,18.3,55.1,19.2z" fill="currentColor"></path>
        <g>
            <g>
                <path d="M26.1,22.8l0,3.4c-9.6,0.3-17.3,8.2-17.3,17.9c0,3.5,1,6.7,2.7,9.5C8.1,50.3,6,45.7,6,40.5      c0-9.9,8-17.9,17.8-17.9C24.6,22.6,25.4,22.7,26.1,22.8z" fill="#00F7EF"></path>
                <path d="M42.1,5.9h-7.3v38.6c0,4.5-3.6,8.2-8,8.2c-3.5,0-6.4-2.2-7.5-5.4c1.3,0.9,2.9,1.5,4.6,1.5      c4.4,0,8-3.6,8-8.1V2h9.7v0.2c0,0.4,0,0.8,0.1,1.2C41.7,4.2,41.9,5.1,42.1,5.9z" fill="#00F7EF"></path>
            </g>
            <path d="M55.1,15.5C55.1,15.5,55.1,15.5,55.1,15.5v3.6c-4-0.8-7.4-3.5-9.3-7.1C48.3,14.3,51.5,15.6,55.1,15.5z" fill="#00F7EF"></path>
        </g>
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
                  <Link href="#" className="text-muted-foreground hover:text-foreground"><XIcon className="h-5 w-5" /> X</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="#" className="text-muted-foreground hover:text-foreground"><TikTokIcon className="h-5 w-5" /> TikTok</Link>
                </Button>
                 <Button variant="ghost" asChild>
                  <Link href="#" className="text-muted-foreground hover:text-[#FF0000]"><Youtube className="h-5 w-5" /> YouTube</Link>
                </Button>
            </div>
        </div>

        <div className="md:col-start-8 md:col-span-2 space-y-4">
          <h4 className="font-bold text-lg">Carwashroom</h4>
          <ul className="space-y-3 text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">About Company</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
          </ul>
        </div>
        
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
