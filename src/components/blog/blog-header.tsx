
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, X } from 'lucide-react';
import { AddPost } from './add-post';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// This component exists to allow client-side interactions (search, new post)
// without making the entire layout a client component.
export function BlogHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
        params.set('search', searchTerm);
    } else {
        params.delete('search');
    }
    // We only want to push a new state if we are on the main blog page
    if (pathname === '/blog') {
      router.push(`${pathname}?${params.toString()}`);
    } else {
       router.push(`/blog?${params.toString()}`);
    }
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    router.push(`${pathname}?${params.toString()}`);
  }
  
  const handlePostAdded = () => {
    // A bit of a hack to force a server component reload.
    // This is necessary because the sidebar needs to update its categories count.
    router.refresh();
  }
  
  const clearSearch = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    if (pathname === '/blog') {
        router.push(`${pathname}?${params.toString()}`);
    } else {
        router.push(`/blog?${params.toString()}`);
    }
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto md:flex-grow max-w-lg">
        <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 rounded-full h-12"
            />
            {searchTerm && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                onClick={clearSearch}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
        </div>
        <Select value={searchParams.get('sort') || 'latest'} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] rounded-full h-12">
                <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
        </Select>
      </form>
      <AddPost onPostAdded={handlePostAdded} />
    </div>
  );
}
