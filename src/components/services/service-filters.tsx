
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Category } from '@/lib/types';
import { ListBusiness } from '@/components/services/list-business';
import { Card, CardContent } from '../ui/card';

const locations = ['USA', 'UK', 'UAE', 'CANADA', 'INDIA', 'CHINA', 'JAPAN'];

type ServiceFiltersProps = {
  categories: Category[];
  fetchBusinessesAction: () => Promise<any>;
};

export function ServiceFilters({ categories, fetchBusinessesAction }: ServiceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive state directly from searchParams to avoid hydration issues
  const searchTerm = searchParams.get('q') || '';
  const selectedCategories = searchParams.get('categories') || 'all';
  const selectedCountry = searchParams.get('country') || 'all';
  const sortBy = searchParams.get('sort') || 'date-desc';

  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm);
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCurrentSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (categories) {
        const otherServicesCategory = categories.find(c => c.name === 'Other Services');
        const alphabetizedCategories = categories
            .filter(c => c.name !== 'Other Services')
            .sort((a, b) => a.name.localeCompare(b.name));

        if (otherServicesCategory) {
            alphabetizedCategories.push(otherServicesCategory);
        }
        setSortedCategories(alphabetizedCategories);
    }
  }, [categories]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSearchTerm) {
      params.set('q', currentSearchTerm);
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (filterName: 'categories' | 'country' | 'sort', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || !value) {
      params.delete(filterName);
    } else {
      params.set(filterName, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
        <div className="flex justify-end">
            <ListBusiness onBusinessListed={fetchBusinessesAction} />
        </div>
        <Card>
            <CardContent className="p-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    <div className="relative lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search for a Service..."
                        className="pl-10 h-12"
                        value={currentSearchTerm}
                        onChange={(e) => setCurrentSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                        }}
                    />
                    </div>
                    <Select value={selectedCategories} onValueChange={(value) => handleFilterChange('categories', value)}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {sortedCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <Select value={selectedCountry} onValueChange={(value) => handleFilterChange('country', value)}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort', value)}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                        <SelectItem value="date-desc">Newest</SelectItem>
                        <SelectItem value="date-asc">Oldest</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
