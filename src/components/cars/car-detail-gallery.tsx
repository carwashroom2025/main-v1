
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ImageIcon } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';

type CarDetailGalleryProps = {
    vehicle: Vehicle;
}

export function CarDetailGallery({ vehicle }: CarDetailGalleryProps) {
  const allImages = vehicle.imageUrls || [];
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
        return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
        setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  
  if (allImages.length === 0) {
    return (
        <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
        </div>
    )
  }

  const handleThumbClick = (index: number) => {
    api?.scrollTo(index);
  }

  return (
    <div>
        <Carousel setApi={setApi} className="relative w-full">
            <CarouselContent>
                {allImages.map((image, index) => (
                    <CarouselItem key={index}>
                        <div className="relative aspect-video">
                            <Image
                                src={image}
                                alt={`${vehicle.name} image ${index + 1}`}
                                fill
                                className="w-full h-auto object-cover rounded-lg"
                                priority={index === 0}
                            />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {allImages.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                </>
            )}
        </Carousel>

        { allImages.length > 1 &&
            <div className="grid grid-cols-5 gap-2 mt-4">
            {allImages.map((image, index) => (
                <button 
                    key={index} 
                    onClick={() => handleThumbClick(index)} 
                    className={`relative aspect-video rounded-md overflow-hidden transition-all ${index === current - 1 ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                >
                <Image
                    src={image}
                    alt={`${vehicle.name} gallery thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                />
                </button>
            ))}
            </div>
        }
    </div>
  );
}
