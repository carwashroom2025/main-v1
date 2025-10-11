
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getCars } from '@/lib/firebase/firestore';
import type { Vehicle } from '@/lib/types';
import { CarTable } from '@/components/admin/car-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { vehicleBrands, vehicleTypes, vehicleYears } from '@/lib/car-data';
import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from '@/components/ui/pagination';
import { Label } from '@/components/ui/label';

const ITEMS_PER_PAGE = 10;

export default function ManageCarsPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt-desc');
    const [brandFilter, setBrandFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchVehicles = async () => {
        setLoading(true);
        const { vehicles: vehiclesFromDb, totalCount: fetchedTotalCount } = await getCars({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            sortBy,
            brandFilter,
            typeFilter,
            yearFilter,
            searchTerm,
        });
        setVehicles(vehiclesFromDb);
        setTotalCount(fetchedTotalCount);
        setLoading(false);
    }

    useEffect(() => {
        fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortBy, brandFilter, typeFilter, yearFilter, searchTerm]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchVehicles();
        }
    }
    
    const handleFilterChange = () => {
        setCurrentPage(1);
        fetchVehicles();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Cars</CardTitle>
                <CardDescription>
                View, add, edit, or remove vehicle listings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                        <div className="relative lg:col-span-1">
                            <Label htmlFor="search-vehicle">Search</Label>
                            <Search className="absolute left-3 bottom-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="search-vehicle"
                                type="text"
                                placeholder="Search by name..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                        <div>
                            <Label htmlFor="brand-filter">Brand</Label>
                            <Select value={brandFilter} onValueChange={(value) => { setBrandFilter(value); setCurrentPage(1); }}>
                                <SelectTrigger id="brand-filter">
                                    <SelectValue placeholder="Filter by brand..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Brands</SelectItem>
                                    {vehicleBrands.map(brand => (
                                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                             <Label htmlFor="type-filter">Type</Label>
                            <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setCurrentPage(1); }}>
                                <SelectTrigger id="type-filter">
                                    <SelectValue placeholder="Filter by type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {vehicleTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="year-filter">Year</Label>
                            <Select value={yearFilter} onValueChange={(value) => { setYearFilter(value); setCurrentPage(1); }}>
                                <SelectTrigger id="year-filter">
                                    <SelectValue placeholder="Filter by year..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {vehicleYears.map(year => (
                                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="sort-by">Sort By</Label>
                            <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
                                <SelectTrigger id="sort-by">
                                    <SelectValue placeholder="Sort by..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="createdAt-desc">Latest</SelectItem>
                                    <SelectItem value="createdAt-asc">Oldest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <>
                    <CarTable vehicles={vehicles} onDataChange={fetchVehicles} />
                    {totalPages > 1 && (
                        <div className="mt-8">
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
                )}
            </CardContent>
        </Card>
    );
}
