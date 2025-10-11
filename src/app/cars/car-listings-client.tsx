
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 9;

export function CarListingsClient() {
  const searchParams = useSearchParams();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: 'all',
    type: 'all',
    year: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchCars() {
        setLoading(true);
        const { vehicles } = await getCars();
        setAllVehicles(vehicles);
        setLoading(false);
    }
    fetchCars();
  }, []);

  useEffect(() => {
    setFilters({
      brand: searchParams.get('brand') || 'all',
      type: searchParams.get('type') || 'all',
      year: searchParams.get('year') || 'all',
    });
    setCurrentPage(1);
  }, [searchParams]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const filteredVehicles = allVehicles.filter((vehicle) => {
    return (
      (filters.brand === 'all' || vehicle.make === filters.brand) &&
      (filters.type === 'all' || vehicle.bodyType === filters.type) &&
      (filters.year === 'all' || vehicle.year.toString() === filters.year)
    );
  });

  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);

  const currentVehicles = filteredVehicles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        </>
    );
  }

  return (
    <>
      <div className="bg-card p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filters.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
                <SelectTrigger>
                <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {vehicleBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
        </div>

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

