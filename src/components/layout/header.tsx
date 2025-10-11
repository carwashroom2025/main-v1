
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Menu, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { logOut } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { NotificationBell } from './notification-bell';
import { getCategories } from '@/lib/firebase/firestore';
import type { Category } from '@/lib/types';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/cars', label: 'Cars' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
        const categoriesFromDb = await getCategories();
        const otherServicesCategory = categoriesFromDb.find(c => c.name === 'Other Services');
        const sortedCategories = categoriesFromDb
            .filter(c => c.name !== 'Other Services')
            .sort((a, b) => a.name.localeCompare(b.name));

        if (otherServicesCategory) {
            sortedCategories.push(otherServicesCategory);
        }
        setCategories(sortedCategories);
    }
    fetchCategories();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout Failed',
        description: 'An error occurred during logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader className="sr-only">
                    <SheetTitle>Mobile Menu</SheetTitle>
                    <SheetDescription>Main navigation and user account links</SheetDescription>
                </SheetHeader>
              <div className="flex flex-col p-4">
                <div onClick={() => router.push('/')} className="mb-8 flex items-center space-x-2 cursor-pointer">
                    <span className="text-2xl font-bold uppercase">Car<span className="text-destructive">washroom</span></span>
                </div>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-lg font-medium uppercase transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  ))}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="categories" className="border-none">
                        <AccordionTrigger className="text-lg font-medium transition-colors hover:text-primary hover:no-underline">
                            CATEGORIES
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-2 pl-4">
                                {categories.map((category) => (
                                    <Link key={category.id} href={`/services?categories=${encodeURIComponent(category.name)}`} className="text-muted-foreground hover:text-primary">
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </nav>
                <div className="mt-8 flex flex-col space-y-2">
                  {!loading && !user ? (
                    <>
                      <Button asChild variant="outline">
                          <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild>
                          <Link href="/register">Register</Link>
                      </Button>
                    </>
                  ) : user && (
                     <Button onClick={handleLogout}>
                        <LogOut className="mr-2" />
                        Logout
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex-1 flex items-center justify-start">
           <div onClick={() => router.push('/')} className="flex items-center space-x-2 cursor-pointer">
            <span className="text-2xl font-bold uppercase">Car<span className="text-destructive">washroom</span></span>
          </div>
        </div>

        <nav className="hidden items-center justify-center space-x-6 lg:flex flex-1">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : ''
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

        <div className="hidden md:flex items-center justify-end space-x-2 flex-1">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted"></div>
              </div>
            ) : user ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><User className="mr-2" />Profile</Link>
                    </DropdownMenuItem>
                    {['Admin', 'Owner'].includes(user.role) && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin"><ShieldCheck className="mr-2" />Admin</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={handleLogout}>
                      <LogOut className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
                <>
                    <Button asChild variant="ghost">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Register</Link>
                    </Button>
                </>
            )}
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
