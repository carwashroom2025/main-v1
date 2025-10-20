
'use client';

import { useState, useEffect } from 'react';
import { ListingCard } from '@/components/services/listing-card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useSearchParams } from 'next/navigation';
import type { Business, Category } from '@/lib/types';
import { ServiceFilters } from './service-filters';

const ITEMS_PER_PAGE = 15;

type ServiceListingsProps = {
  initialBusinessListings: Business[];
  categories: Category[];
  fetchBusinessesAction: () => Promise<Business[]>;
};

export function ServiceListings({ 
    initialBusinessListings, 
    categories, 
    fetchBusinessesAction 
}: ServiceListingsProps) {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [businessListings, setBusinessListings] = useState<Business[]>(initialBusinessListings);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  const selectedCategories = searchParams.get('categories')?.split(',') || [];
  const selectedCountry = searchParams.get('country') || 'all';
  const sortBy = searchParams.get('sort') || 'date-desc';

  const onBusinessListed = async () => {
    const updatedListings = await fetchBusinessesAction();
    setBusinessListings(updatedListings);
  };

  useEffect(() => {
    setBusinessListings(initialBusinessListings);
  }, [initialBusinessListings]);
  
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  const filteredListings = businessListings
    .filter((listing) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories[0] === 'all' ||
        selectedCategories.includes(listing.category);
      const countryMatch =
        !selectedCountry ||
        selectedCountry === 'all' ||
        listing.location.includes(selectedCountry);
      const searchMatch =
        !searchTerm ||
        listing.title.toLowerCase().startsWith(searchTerm.toLowerCase());
      return categoryMatch && countryMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating-desc') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      if (sortBy === 'name-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'name-desc') {
        return b.title.localeCompare(a.title);
      }
      if (a.createdAt && b.createdAt) {
        if (sortBy === 'date-desc') {
            return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
        }
        if (sortBy === 'date-asc') {
            return new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime();
        }
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);

  const currentListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <ServiceFilters categories={categories} onBusinessListed={onBusinessListed} />
      <div className="space-y-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          {currentListings.length === 0 && (
            <p className="text-center text-muted-foreground col-span-full">
              No services found matching your criteria.
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(Math.max(1, currentPage - 1));
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
                      handlePageChange(Math.min(totalPages, currentPage + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}
