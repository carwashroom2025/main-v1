
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getAllBusinessesForAdmin, getFeaturedBusinesses, getCategories } from '@/lib/firebase/firestore';
import type { Business, Category } from '@/lib/types';
import { BusinessTable } from '@/components/admin/business-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Star, X } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from '@/components/ui/pagination';
import { ListingCard } from '@/components/services/listing-card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const locations = ['USA', 'UK', 'UAE', 'CANADA', 'INDIA', 'CHINA', 'JAPAN'];
const ITEMS_PER_PAGE = 10;

export default function ManageBusinessPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt-desc');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

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

    const fetchPageData = async () => {
        setLoading(true);
        const [
            { businesses: businessesFromDb, totalCount: fetchedTotalCount },
            featuredBusinessesFromDb,
            categoriesFromDb,
        ] = await Promise.all([
            getAllBusinessesForAdmin({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                sortBy,
                categoryFilter,
                countryFilter: countryFilter,
                searchTerm,
            }),
            getFeaturedBusinesses(),
            getCategories(),
        ]);
        setBusinesses(businessesFromDb);
        setTotalCount(fetchedTotalCount);
        setFeaturedBusinesses(featuredBusinessesFromDb);
        setCategories(categoriesFromDb);
        setLoading(false);
    }
    
    const fetchAllBusinesses = async () => {
        setLoading(true);
        const { businesses: businessesFromDb, totalCount: fetchedTotalCount } = await getAllBusinessesForAdmin({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            sortBy,
            categoryFilter,
            countryFilter: countryFilter,
            searchTerm,
        });
        setBusinesses(businessesFromDb);
        setTotalCount(fetchedTotalCount);
        setLoading(false);
    }


    useEffect(() => {
        fetchPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortBy, categoryFilter, countryFilter, searchTerm]);
    
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchAllBusinesses();
        }
    }
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 text-yellow-400" />
                        <CardTitle>Featured Businesses</CardTitle>
                    </div>
                    <CardDescription>
                        These businesses are currently featured on the homepage. You can feature up to 3 businesses at a time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && businesses.length === 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                    ) : featuredBusinesses.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {featuredBusinesses.map(business => (
                                <ListingCard key={business.id} listing={business} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No businesses are currently featured.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Manage All Businesses</CardTitle>
                <CardDescription>
                View, add, edit, or remove business listings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                        <div className="relative lg:col-span-1">
                            <Label htmlFor="search-business">Search</Label>
                            <Search className="absolute left-3 bottom-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="search-business"
                                type="text"
                                placeholder="Search by name..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                            {searchTerm && (
                                <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 bottom-1 h-8 w-8 rounded-full"
                                onClick={() => setSearchTerm('')}
                                >
                                <X className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                        <div>
                             <Label htmlFor="category-filter">Category</Label>
                            <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setCurrentPage(1); }}>
                                <SelectTrigger id="category-filter">
                                    <SelectValue placeholder="Filter by category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {sortedCategories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                             <Label htmlFor="country-filter">Country</Label>
                            <Select value={countryFilter} onValueChange={(value) => { setCountryFilter(value); setCurrentPage(1); }}>
                                <SelectTrigger id="country-filter">
                                    <SelectValue placeholder="Filter by country..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Countries</SelectItem>
                                    {locations.map(loc => (
                                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
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
                    <BusinessTable businesses={businesses} onDataChange={fetchAllBusinesses} featuredCount={featuredBusinesses.length} categories={categories} />
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
        </div>
    );
}
