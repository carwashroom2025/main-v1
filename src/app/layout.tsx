
import type { Metadata } from 'next';
import { Space_Grotesk, Poppins, Sacramento } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/context/providers';
import { getSettings } from '@/lib/firebase/firestore';
import type { SeoSettings } from '@/lib/types';
import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { Suspense } from 'react';


const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const sacramento = Sacramento({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings('seo') as SeoSettings;

  return {
    title: settings?.siteTitle || 'Carwashroom',
    description: settings?.metaDescription || 'A modern, professional, responsive automotive business directory website called Carwashroom.',
    keywords: settings?.metaKeywords || 'automotive, cars, business directory, car services',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning className={`${sacramento.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <Providers>
          <Suspense>
            <ScrollToTop />
          </Suspense>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
