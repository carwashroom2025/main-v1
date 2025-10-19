

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBusiness, getReviews, getCategories } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { ReviewSection } from '@/components/services/review-section';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { BusinessDetailGallery } from '@/components/services/business-detail-gallery';
import { Separator } from '@/components/ui/separator';
import { BusinessDetailHeader } from '@/components/services/business-detail-header';
import type { Business, Review } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export default async function BusinessDetailPage({ params }: { params: { id: string } }) {
  const business = await getBusiness(params.id);

  if (!business) {
    notFound();
  }

  const [reviews, categories] = await Promise.all([
    getReviews(params.id),
    getCategories()
  ]);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
    : 0;
  
  const serializableReviews = reviews.map(review => ({
    ...review,
    createdAt: review.createdAt.toDate().toISOString(),
  }));

  const mapImage = PlaceHolderImages.find((img) => img.id === 'map-placeholder');

  const serializableBusiness = {
    ...business,
    createdAt: (business.createdAt as Timestamp).toDate().toISOString(),
  } as unknown as Business;


  return (
    <>
    <title>{`${business.title} | Carwashroom`}</title>
    <div className="container py-8 md:py-12">
        <div className="mb-8">
            <BusinessDetailHeader business={serializableBusiness} averageRating={averageRating} reviewCount={totalReviews} categories={categories} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <BusinessDetailGallery business={serializableBusiness} />
            </div>

            <div className="lg:col-span-1 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center text-sm">
                            <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Phone</p>
                                <a href={`tel:${business.contact.phone}`} className="font-semibold hover:underline">{business.contact.phone}</a>
                            </div>
                        </div>
                         <div className="flex items-center text-sm">
                            <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <a href={`mailto:${business.contact.email}`} className="font-semibold hover:underline">{business.contact.email}</a>
                            </div>
                        </div>
                         <div className="flex items-center text-sm">
                            <Globe className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Website</p>
                                <a href={`https://${business.contact.website}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{business.contact.website}</a>
                            </div>
                        </div>
                         <div className="flex items-start text-sm">
                            <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-muted-foreground">Location</p>
                                <p className="font-semibold">{business.location}</p>
                            </div>
                        </div>
                         <div className="flex items-start text-sm">
                            <Calendar className="h-5 w-5 mr-3 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-muted-foreground">Date Listed</p>
                                <p className="font-semibold">{format((business.createdAt as Timestamp).toDate(), 'PPP')}</p>
                            </div>
                        </div>
                        {business.ownerName && (
                            <div className="flex items-start text-sm">
                                <User className="h-5 w-5 mr-3 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-muted-foreground">Listed by</p>
                                    <p className="font-semibold">{business.ownerName}</p>
                                </div>
                            </div>
                        )}
                        {(business.openingHours || business.closingHours) && (
                            <div className="flex items-start text-sm">
                                <Clock className="h-5 w-5 mr-3 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-muted-foreground">Hours</p>
                                    <p className="font-semibold">{business.openingHours || 'N/A'} - {business.closingHours || 'N/A'}</p>
                                </div>
                            </div>
                        )}
                        { (business.socials.twitter || business.socials.facebook || business.socials.instagram) &&
                            <div className="flex items-center text-sm pt-2">
                                <div className="flex space-x-2">
                                    {business.socials.twitter && <Button variant="outline" size="icon" asChild>
                                        <a href={business.socials.twitter}><Twitter className="h-4 w-4" /></a>
                                    </Button>}
                                    {business.socials.facebook && <Button variant="outline" size="icon" asChild>
                                        <a href={business.socials.facebook}><Facebook className="h-4 w-4" /></a>
                                    </Button>}
                                    {business.socials.instagram && <Button variant="outline" size="icon" asChild>
                                        <a href={business.socials.instagram}><Instagram className="h-4 w-4" /></a>
                                    </Button>}
                                </div>
                            </div>
                        }
                    </CardContent>
                </Card>
                 <Button size="lg" className="w-full" asChild>
                    <a href={`mailto:${business.contact.email}`}>Book a Service</a>
                </Button>
            </div>
        </div>

        <div className="mt-12">
            <Card>
                <CardHeader>
                    <CardTitle>About {business.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>{business.description}</p>
                    <Separator className="my-4" />
                    <div className="flex items-start text-sm">
                        <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-1" />
                        <div>
                            <p className="font-semibold text-foreground">Address</p>
                            <p>{business.address}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="mt-12">
            <Card>
                <CardHeader>
                    <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                    {mapImage && (
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                            <Image
                                src={mapImage.imageUrl}
                                alt="Location map"
                                fill
                                className="object-cover"
                                data-ai-hint={mapImage.imageHint}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    
        <div className="mt-12">
            <ReviewSection 
                itemId={business.id}
                itemType="business"
                itemTitle={business.title}
                initialReviews={serializableReviews as Review[]}
            />
        </div>
    </div>
    </>
  );
}
