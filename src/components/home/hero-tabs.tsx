
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <Tabs defaultValue="services" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm">
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="cars">Cars</TabsTrigger>
      </TabsList>
      <TabsContent value="services">
        <form onSubmit={handleServiceSearch} className="flex w-full flex-col items-center gap-4 rounded-b-lg rounded-tr-lg bg-white/90 dark:bg-black/50 p-4 shadow-lg backdrop-blur-sm sm:flex-row">
          <div className="relative w-full">
              <Select name="categories">
                  <SelectTrigger className="w-full text-card-foreground">
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
          <Button size="lg" className="w-full sm:w-auto" type="submit">Search</Button>
        </form>
      </TabsContent>
      <TabsContent value="cars">
          <form onSubmit={handleCarSearch} className="flex w-full flex-col items-center gap-4 rounded-b-lg rounded-tl-lg bg-white/90 dark:bg-black/50 p-4 shadow-lg backdrop-blur-sm sm:flex-row">
              <div className="relative w-full">
                  <Select name="brand">
                      <SelectTrigger className="w-full text-card-foreground">
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
                      <SelectTrigger className="w-full text-card-foreground">
                          <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                          {vehicleTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <Button size="lg" className="w-full sm:w-auto" type="submit">Search</Button>
          </form>
      </TabsContent>
    </Tabs>
  );
}
