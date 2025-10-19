
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, ArrowRight, ImageIcon } from 'lucide-react';
import type { Business } from '@/lib/types';
import { StarRating } from '../shared/star-rating';
import { Badge } from '../ui/badge';

type ListingCardProps = {
  listing: Business & { averageRating?: number; reviewCount?: number };
};

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.mainImageUrl;
  const averageRating = listing.averageRating || 0;
  const reviewCount = listing.reviewCount || 0;

  return (
    <Card className="group overflow-hidden flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-[16/10]">
        <Link href={`/services/${listing.id}`} className="block h-full w-full">
          {image ? (
            <Image
              src={image}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
           <Badge variant="secondary" className="absolute top-3 left-3">{listing.category}</Badge>
        </Link>
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <CardTitle className="leading-tight text-lg pt-1 group-hover:text-primary transition-colors">
            <Link href={`/services/${listing.id}`}>{listing.title}</Link>
        </CardTitle>
        <div className="pt-2">
            <StarRating rating={averageRating} reviewCount={reviewCount} size="sm" />
        </div>
        <CardDescription className="line-clamp-2 mt-2 flex-grow text-sm">{listing.description}</CardDescription>
        
        <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center text-xs text-muted-foreground w-full">
                <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{listing.contact.phone}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground w-full">
                <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{listing.contact.email}</span>
            </div>
        </div>
      </CardContent>
       <CardFooter className="p-4 pt-0">
          <Button asChild size="sm" className="w-full">
                <Link href={`/services/${listing.id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
          </Button>
       </CardFooter>
    </Card>
  );
}
