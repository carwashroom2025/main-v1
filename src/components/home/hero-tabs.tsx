'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vehicleBrands, vehicleTypes } from '@/lib/car-data';
import { Car } from 'lucide-react';
import Link from 'next/link';
import { getCategories } from '@/lib/firebase/firestore';
import type { Category } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

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

  return (
    <Tabs defaultValue="services" className="w-full">
      <TabsList className="group grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm border-none text-white rounded-t-lg rounded-b-none p-2 h-auto transition-all duration-500">
        <TabsTrigger value="services" className="data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground rounded-md transition-colors duration-500">Services</TabsTrigger>
        <TabsTrigger value="cars" className="relative data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground rounded-md transition-colors duration-500">
          <Car className="absolute -left-8 top-1/2 -translate-y-1/2 h-5 w-5 opacity-0 -translate-x-4 group-data-[state=cars]:opacity-100 group-data-[state=cars]:translate-x-0 transition-all duration-500" />
          Cars
        </TabsTrigger>
      </TabsList>
      <TabsContent value="services" className="bg-white/20 backdrop-blur-sm p-6 rounded-b-lg mt-0">
          <form onSubmit={handleServiceSearch} className="flex w-full flex-col items-center gap-4 sm:flex-row">
              <div className="relative w-full">
                  <Select name="categories">
                      <SelectTrigger className="w-full text-card-foreground">
                          <SelectValue placeholder="What service are you looking for?" />
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
                      <SelectTrigger id="country-select" className="w-full sm:w-[180px] text-card-foreground">
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
              <Button size="lg" className="w-full sm:w-auto" type="submit">
                  Search
              </Button>
          </form>
      </TabsContent>
      <TabsContent value="cars" className="bg-white/20 backdrop-blur-sm p-6 rounded-b-lg mt-0">
            <form action="/cars" method="GET" className="flex w-full flex-col items-center gap-4 sm:flex-row">
              <div className="relative w-full">
                  <Select name="brand">
                      <SelectTrigger className="w-full text-card-foreground">
                          <SelectValue placeholder="Select Brand" />
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
                      <SelectTrigger className="w-full text-card-foreground">
                          <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                          {vehicleTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <Button size="lg" className="w-full sm:w-auto" type="submit">
                  Search
              </Button>
          </form>
      </TabsContent>
    </Tabs>
  );
}
