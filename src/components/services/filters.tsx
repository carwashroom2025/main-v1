

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getCategories } from '@/lib/firebase/firestore';
import type { Category } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';

const locations = ['USA', 'UK', 'UAE', 'CANADA', 'INDIA', 'CHINA', 'JAPAN'];

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
    }
    fetchCategories();
  }, []);

  const handleCategoryChange = (checked: boolean, categoryName: string) => {
    const params = new URLSearchParams(searchParams);
    const categories = params.get('categories')?.split(',') || [];
    const newCategories = checked
      ? [...categories, categoryName]
      : categories.filter((c) => c !== categoryName);

    if (newCategories.length > 0) {
      params.set('categories', newCategories.join(','));
    } else {
      params.delete('categories');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCountryChange = (country: string) => {
    const params = new URLSearchParams(searchParams);
    if (country === 'all') {
      params.delete('country');
    } else {
      params.set('country', country);
    }
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('categories');
    params.delete('country');
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectedCategories = searchParams.get('categories')?.split(',') || [];
  const selectedCountry = searchParams.get('country') || 'all';
  const areFiltersApplied = selectedCategories.length > 0 || selectedCountry !== 'all';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-muted-foreground">Category</h3>
                {areFiltersApplied && (
                    <Button variant="link" className="p-0 h-auto" onClick={handleClearFilters}>
                        Clear Filters
                    </Button>
                )}
            </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))
            ) : (
                categories.map((category) => {
                const categoryId = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return (
                    <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                        id={categoryId}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={(checked) =>
                        handleCategoryChange(checked as boolean, category.name)
                        }
                    />
                    <Label htmlFor={categoryId}>
                        {category.name}
                    </Label>
                    </div>
                )
                })
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-4 text-muted-foreground">Country</h3>
          <RadioGroup
            value={selectedCountry}
            onValueChange={handleCountryChange}
            className="flex flex-wrap gap-x-6 gap-y-4"
          >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all-locations" />
                <Label htmlFor="all-locations">All</Label>
              </div>
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={location}
                    id={location.toLowerCase()}
                  />
                  <Label htmlFor={location.toLowerCase()}>{location}</Label>
                </div>
              ))}
          </RadioGroup>
        </div>
    </div>
  );
}
