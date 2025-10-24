

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, X, PlusCircle, LayoutGrid, List } from 'lucide-react';
import { AddPost } from './add-post';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { cn } from '@/lib/utils';

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
    if (pathname === '/blog') {
      router.push(`${pathname}?${params.toString()}`);
    } else {
       router.push(`/blog?${params.toString()}`);
    }
  };
  
  const handleViewChange = (view: string) => {
    if (view) {
        const params = new URLSearchParams(searchParams);
        params.set('view', view);
        router.push(`${pathname}?${params.toString()}`);
    }
  }

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
  
  const currentView = searchParams.get('view') || 'grid';

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <form onSubmit={handleSearch} className="flex-grow w-full md:w-auto">
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search articles, topics, or authors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-card border-border"
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
      </form>
      <div className="flex items-center gap-2">
        <ToggleGroup type="single" value={currentView} onValueChange={handleViewChange} aria-label="View mode">
          <ToggleGroupItem value="grid" aria-label="Grid view" className="h-12 w-12 data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
            <LayoutGrid className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="h-12 w-12 data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
            <List className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Select value={searchParams.get('sort') || 'latest'} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] h-12 bg-card border-border">
                <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
        </Select>
        <Button onClick={handlePostAdded} className="h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            <PlusCircle className="mr-2 h-5 w-5" />
            New Post
        </Button>
      </div>
    </div>
  );
}
