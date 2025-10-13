
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ListCarButton } from '@/components/cars/list-car-button';
import { Timestamp } from 'firebase/firestore';

const ITEMS_PER_PAGE = 9;

export function CarListingsClient({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const searchParams = useSearchParams();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(initialVehicles);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const brand = searchParams.get('brand') || 'all';
  const type = searchParams.get('type') || 'all';
  const year = searchParams.get('year') || 'all';

  const fetchCars = async () => {
    setLoading(true);
    const { vehicles } = await getCars({all: true});
    const serializedVehicles = vehicles.map(v => ({
      ...v,
      createdAt: v.createdAt ? (v.createdAt as Timestamp).toDate().toISOString() : undefined,
    })) as Vehicle[];
    setAllVehicles(serializedVehicles);
    setLoading(false);
  }

  const onCarListed = () => {
    fetchCars();
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [brand, type, year]);

  const filteredVehicles = useMemo(() => allVehicles.filter((vehicle) => {
    return (
      (brand === 'all' || vehicle.make === brand) &&
      (type === 'all' || vehicle.bodyType === type) &&
      (year === 'all' || vehicle.year.toString() === year)
    );
  }), [allVehicles, brand, type, year]);

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
      <div className="bg-card p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <Select value={brand} onValueChange={(value) => {
                const params = new URLSearchParams(searchParams.toString());
                if (value === 'all') params.delete('brand'); else params.set('brand', value);
                window.history.pushState(null, '', `?${params.toString()}`);
                // This will trigger a re-render and the useEffect will catch the change
            }}>
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
            <Select value={type} onValueChange={(value) => {
                const params = new URLSearchParams(searchParams.toString());
                if (value === 'all') params.delete('type'); else params.set('type', value);
                window.history.pushState(null, '', `?${params.toString()}`);
            }}>
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
            <Select value={year} onValueChange={(value) => {
                const params = new URLSearchParams(searchParams.toString());
                if (value === 'all') params.delete('year'); else params.set('year', value);
                window.history.pushState(null, '', `?${params.toString()}`);
            }}>
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
            <ListCarButton onCarListed={onCarListed} />
            </div>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
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
