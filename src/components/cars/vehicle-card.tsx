
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Gauge, GitPullRequest, Fuel, ImageIcon } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const image = vehicle.imageUrls?.[0];
  const { user, loading, toggleFavoriteCar } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const isFavorite = user?.favoriteCars?.includes(vehicle.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
        toast({
            title: "Please log in",
            description: "You need to be logged in to favorite a car.",
            variant: "destructive"
        });
        router.push('/login');
        return;
    }
    toggleFavoriteCar(vehicle.id);
  }

  return (
    <Card className="overflow-hidden group">
      <CardContent className="p-0">
        <div className="relative aspect-video">
          <Link href={`/cars/${vehicle.id}`} scroll={false}>
            {image ? (
                <Image
                    src={image}
                    alt={vehicle.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            ) : (
                 <div className="flex items-center justify-center h-full bg-muted">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
            )}
          </Link>
          <div className="absolute top-3 right-3 flex space-x-2">
            <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 bg-white/20 hover:bg-white/40 rounded-full"
                onClick={handleFavoriteClick}
                disabled={loading}
            >
              <Heart className={cn("h-4 w-4 text-white", isFavorite && "fill-red-500")} />
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-bold">
            <Link href={`/cars/${vehicle.id}`} scroll={false}>{vehicle.name}</Link>
          </h3>
           <div className="flex items-baseline justify-between">
             <p className="text-muted-foreground">{vehicle.bodyType}</p>
           </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              <span>{vehicle.horsepower}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitPullRequest className="h-4 w-4" />
              <span>{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              <span>{vehicle.fuelType}</span>
            </div>

          </div>
          <div className="flex justify-end items-center pt-2">
            <Button asChild variant="link" className="p-0">
                <Link href={`/cars/${vehicle.id}`} scroll={false}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
