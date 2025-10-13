
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { vehicleBrands, vehicleTypes, vehicleYears } from '@/lib/car-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VehicleCard } from '@/components/cars/vehicle-card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { Vehicle } from '@/lib/types';
import { getCars } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ListCarButton } from '@/components/cars/list-car-button';
import { toISODate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

export function CarListingsClient({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(initialVehicles);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const brand = searchParams.get('brand') || 'all';
  const type = searchParams.get('type') || 'all';
  const year = searchParams.get('year') || 'all';
  const searchTerm = searchParams.get('q') || '';

  const updateURL = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handleFilterChange = (filterName: 'brand' | 'type' | 'year', value: string) => {
    updateURL(filterName, value);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateURL('q', e.target.value);
  }

  const clearSearch = () => {
    updateURL('q', '');
  }

  const fetchCars = async () => {
    setLoading(true);
    const { vehicles } = await getCars({all: true});
    const serializedVehicles = vehicles.map(v => ({
      ...v,
      createdAt: toISODate(v.createdAt),
    })) as Vehicle[];
    setAllVehicles(serializedVehicles);
    setLoading(false);
  }

  const onCarListed = () => {
    fetchCars();
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [brand, type, year, searchTerm]);

  const filteredVehicles = useMemo(() => allVehicles.filter((vehicle) => {
    return (
      (brand === 'all' || vehicle.make === brand) &&
      (type === 'all' || vehicle.bodyType === type) &&
      (year === 'all' || vehicle.year.toString() === year) &&
      (searchTerm === '' || vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }), [allVehicles, brand, type, year, searchTerm]);

  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);

  const currentVehicles = useMemo(() => filteredVehicles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [filteredVehicles, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-8">
        <ListCarButton onCarListed={onCarListed} />
      </div>
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  type="text"
                  placeholder="Search by name..."
                  className="pl-10 h-12 pr-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
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
            <Select value={brand} onValueChange={(value) => handleFilterChange('brand', value)}>
                <SelectTrigger className="h-12">
                <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {vehicleBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="h-12">
                <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger className="h-12">
                <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {vehicleYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </CardContent>
      </Card>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        ) : currentVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No Cars Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </div>
        )}

        {totalPages > 1 && (
            <div className="mt-12">
            <Pagination>
                <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                    }}
                    />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                    <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                        }}
                    >
                        {page}
                    </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                    }}
                    />
                </PaginationItem>
                </PaginationContent>
            </Pagination>
            </div>
        )}
    </>
  );
}
