
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, ArrowRight, ImageIcon } from 'lucide-react';
import type { Business } from '@/lib/types';

type ListingCardProps = {
  listing: Business;
};

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.mainImageUrl;

  return (
    <Card className="group overflow-hidden flex flex-col">
      <div className="relative aspect-video">
        <Link href={`/services/${listing.id}`} className="block h-full w-full">
          {image ? (
            <Image
              src={image}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </Link>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <CardHeader className="p-0">
          <CardDescription className="text-primary font-semibold">{listing.category}</CardDescription>
          <CardTitle className="hover:text-primary leading-tight text-xl pt-1">
            <Link href={`/services/${listing.id}`}>{listing.title}</Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0 mt-3">
          <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-3 p-0 mt-4 pt-4 border-t">
          <div className="flex items-center text-sm text-muted-foreground w-full">
            <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="truncate">{listing.contact.phone}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground w-full">
            <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="truncate">{listing.contact.email}</span>
          </div>
          <div className="w-full text-right mt-2">
            <Button asChild variant="default" size="sm">
                  <Link href={`/services/${listing.id}`}>
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
