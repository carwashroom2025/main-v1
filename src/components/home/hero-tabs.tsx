
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCategories } from '@/lib/firebase/firestore';
import type { Category } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { vehicleBrands, vehicleTypes } from '@/lib/car-data';
import { Send } from 'lucide-react';

export function HeroTabs() {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

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

  const handleServiceSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = formData.get('categories') as string;
    const country = formData.get('country') as string;
    
    const params = new URLSearchParams();
    if (category) {
      params.set('categories', category);
    }
    if (country) {
      params.set('country', country);
    }

    if (params.toString()) {
      router.push(`/services?${params.toString()}`);
    } else {
      router.push('/services');
    }
  };
  
  const handleCarSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const brand = formData.get('brand') as string;
    const type = formData.get('type') as string;
    
    const params = new URLSearchParams();
    if (brand) {
      params.set('brand', brand);
    }
    if (type) {
      params.set('type', type);
    }
    
    router.push(`/cars?${params.toString()}`);
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form onSubmit={handleServiceSearch} className="flex w-full flex-col items-center gap-4 sm:flex-row p-4 border rounded-md">
            <h3 className="font-bold text-lg text-card-foreground">Search Services</h3>
            <div className="relative w-full">
                <Select name="categories">
                    <SelectTrigger className="w-full text-card-foreground bg-white">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="relative w-full sm:w-auto">
                <Select name="country">
                    <SelectTrigger id="country-select" className="w-full sm:w-[180px] text-card-foreground bg-white">
                        <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="CANADA">CANADA</SelectItem>
                        <SelectItem value="INDIA">INDIA</SelectItem>
                        <SelectItem value="CHINA">CHINA</SelectItem>
                        <SelectItem value="JAPAN">JAPAN</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button size="lg" className="w-full sm:w-auto bg-destructive hover:bg-destructive/80" type="submit">
                <Send className="h-5 w-5" />
            </Button>
        </form>
        <form onSubmit={handleCarSearch} className="flex w-full flex-col items-center gap-4 sm:flex-row p-4 border rounded-md">
            <h3 className="font-bold text-lg text-card-foreground">Search Cars</h3>
              <div className="relative w-full">
                  <Select name="brand">
                      <SelectTrigger className="w-full text-card-foreground bg-white">
                          <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                          {vehicleBrands.map((brand) => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <div className="relative w-full">
                    <Select name="type">
                      <SelectTrigger className="w-full text-card-foreground bg-white">
                          <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                          {vehicleTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <Button size="lg" className="w-full sm:w-auto bg-destructive hover:bg-destructive/80" type="submit">
                   <Send className="h-5 w-5" />
              </Button>
          </form>
      </div>
    </div>
  );
}
