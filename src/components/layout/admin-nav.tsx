
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckCircle,
  Briefcase,
  Users,
  MessageSquare,
  Car,
  ShieldCheck,
  Home,
  FileText,
  Activity,
  HelpCircle,
  Shapes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/listings', label: 'Approve Listings', icon: CheckCircle },
  { href: '/admin/business', label: 'Manage Business', icon: Briefcase },
  { href: '/admin/cars', label: 'Manage Cars', icon: Car },
  { href: '/admin/categories', label: 'Manage Categories', icon: Shapes },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/reviews', label: 'Moderate Reviews', icon: MessageSquare },
  { href: '/admin/blog', label: 'Manage Blog', icon: FileText },
  { href: '/admin/forum', label: 'Manage Forum', icon: HelpCircle },
  { href: '/admin/activity', label: 'Activity Log', icon: Activity },
  { href: '/admin/settings', label: 'Security & SEO', icon: ShieldCheck },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 sticky top-20">
      {adminNavLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === link.href && 'bg-muted text-primary'
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
       <div className="mt-4 border-t pt-4">
        <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-3">
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
            </Button>
        </Link>
      </div>
    </nav>
  );
}
