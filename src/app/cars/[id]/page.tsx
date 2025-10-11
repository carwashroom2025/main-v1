

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Car,
  Settings,
  Calendar,
  Fuel,
  GitPullRequest,
  Gauge,
  Zap,
  MoveHorizontal,
  ArrowRightLeft,
  Truck,
  Building,
  Check,
  Users,
  Ruler,
  Scaling,
  Box,
  ShieldCheck,
  FileText,
  Heart,
  Share2,
  Star,
  Disc,
  CircleDot,
  Thermometer,
  Wind,
  DoorOpen,
  GitBranch,
  Info
} from 'lucide-react';
import type { Vehicle, Review } from '@/lib/types';
import { CarDetailGallery } from '@/components/cars/car-detail-gallery';
import { Separator } from '@/components/ui/separator';
import { getCars, getReviews } from '@/lib/firebase/firestore';
import { ReviewSection } from '@/components/services/review-section';
import { VehicleCard } from '@/components/cars/vehicle-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CarDetailHeader } from '@/components/cars/car-detail-header';
import { Timestamp } from 'firebase/firestore';

async function getVehicle(id: string): Promise<Vehicle | null> {
    const { vehicles } = await getCars({ all: true });
    const vehicle = vehicles.find((v) => v.id.toString() === id);
    return vehicle || null;
}

async function getSimilarCars(vehicle: Vehicle): Promise<Vehicle[]> {
    if (!vehicle) return [];
    const { vehicles } = await getCars({ all: true });
    
    const similar = vehicles.filter(v => {
        if (v.id === vehicle.id) return false;
        return v.make === vehicle.make || v.bodyType === vehicle.bodyType || v.fuelType === vehicle.fuelType;
    });

    return similar.slice(0, 4);
}

const iconMap: { [key: string]: React.ElementType } = {
    // Overview
    make: Building,
    model: Car,
    year: Calendar,
    bodyType: Car,
    driveType: ArrowRightLeft,
    fuelType: Fuel,
    doors: DoorOpen,
    seats: Users,
    variants: GitBranch,

    // Performance & Safety
    engine: Settings,
    transmission: GitPullRequest,
    displacement: Scaling,
    cylinders: CircleDot,
    horsepower: Zap,
    torque: Gauge,
    brakeSpec: Disc,
    tireSpec: Disc,
    airbags: ShieldCheck,
    acceleration: Zap,
    topSpeed: Zap,
    suspension: GitPullRequest,

    // Technical Specification
    length: MoveHorizontal,
    height: MoveHorizontal,
    width: MoveHorizontal,
    wheelbase: MoveHorizontal,
    groundClearance: Ruler,
    vehicleWeight: Truck,
    maxPayload: Truck,
    bootSpace: Box,
    dragCoefficient: Wind,
};

function SpecItem({ label, value, icon, unit }: { label: string, value: string | number, icon?: React.ElementType, unit?: string }) {
    if (!value && value !== 0) return null;
    const Icon = icon;
    return (
        <div className="flex items-center justify-between text-sm py-2">
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
              <p className="text-muted-foreground">{label}</p>
            </div>
            <p className="font-semibold">{value}{unit && ` ${unit}`}</p>
        </div>
    );
}

function FeatureList({ title, features, icon }: { title: string, features?: string[], icon?: React.ReactNode }) {
    if (!features || features.length === 0) return null;
    return (
        <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">{icon}{title}</h3>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-muted-foreground">
                {features.map((item) => (
                    <li key={item} className="flex items-center">
                        <Check className="h-4 w-4 text-primary mr-2" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicle(params.id);

  if (!vehicle) {
    notFound();
  }
  
  const reviews = await getReviews(params.id);
  const similarCars = await getSimilarCars(vehicle);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
    : 0;
  
  const serializableReviews = reviews.map(review => ({
    ...review,
    createdAt: (review.createdAt as Timestamp).toDate().toISOString(),
  }));


  const serializableVehicle = {
    ...vehicle,
    createdAt: vehicle.createdAt ? (vehicle.createdAt as Timestamp).toDate().toISOString() : undefined,
  };
  
  const serializableSimilarCars = similarCars.map(car => ({
      ...car,
      createdAt: car.createdAt ? (car.createdAt as Timestamp).toDate().toISOString() : undefined,
  }));

  const overview = [
    { label: "Make", value: vehicle.make, icon: iconMap.make },
    { label: "Model", value: vehicle.model, icon: iconMap.model },
    { label: "Year", value: vehicle.year, icon: iconMap.year },
    { label: "Body Type", value: vehicle.bodyType, icon: iconMap.bodyType },
    { label: "Drive Type", value: vehicle.driveType, icon: iconMap.driveType },
    { label: "Fuel Type", value: vehicle.fuelType, icon: iconMap.fuelType },
    { label: "Doors", value: vehicle.doors, icon: iconMap.doors },
    { label: "Seats", value: vehicle.seats, icon: iconMap.seats },
    { label: "Variants", value: vehicle.variants?.join(', '), icon: iconMap.variants },
  ];

  const performanceAndSafety = [
    { label: "Engine", value: vehicle.engine, icon: iconMap.engine },
    { label: "Transmission", value: vehicle.transmission, icon: iconMap.transmission },
    { label: "Displacement", value: vehicle.displacement, icon: iconMap.displacement },
    { label: "Cylinders", value: vehicle.cylinders, icon: iconMap.cylinders },
    { label: "Horsepower", value: vehicle.horsepower, icon: iconMap.horsepower },
    { label: "Torque", value: vehicle.torque, icon: iconMap.torque },
    { label: "Brake Spec", value: vehicle.brakeSpec, icon: iconMap.brakeSpec },
    { label: "Tire Spec", value: vehicle.tireSpec, icon: iconMap.tireSpec },
    { label: "Airbags", value: vehicle.airbags, icon: iconMap.airbags },
    { label: "Acceleration (0-60mph)", value: vehicle.acceleration, icon: iconMap.acceleration },
    { label: "Top Speed", value: vehicle.topSpeed, icon: iconMap.topSpeed },
    { label: "Suspension", value: vehicle.suspension, icon: iconMap.suspension },
  ];
  
  const techSpecs = [
      { label: 'Length', value: vehicle.length, icon: iconMap.length, unit: 'mm' },
      { label: 'Height', value: vehicle.height, icon: iconMap.height, unit: 'mm' },
      { label: 'Width', value: vehicle.width, icon: iconMap.width, unit: 'mm' },
      { label: 'Wheelbase', value: vehicle.wheelbase, icon: iconMap.wheelbase, unit: 'mm' },
      { label: 'Ground Clearance', value: vehicle.groundClearance, icon: iconMap.groundClearance, unit: 'mm' },
      { label: 'Vehicle Weight', value: vehicle.vehicleWeight, icon: iconMap.vehicleWeight, unit: 'kg' },
      { label: 'Max Payload', value: vehicle.maxPayload, icon: iconMap.maxPayload, unit: 'kg' },
      { label: 'Boot Space', value: vehicle.bootSpace, icon: iconMap.bootSpace, unit: 'L' },
      { label: 'Drag Coefficient', value: vehicle.dragCoefficient, icon: iconMap.dragCoefficient },
  ];


  return (
    <>
    <title>{`${vehicle.name} | Carwashroom`}</title>
    <div className="container py-8 md:py-12">
        <CarDetailHeader vehicle={serializableVehicle as Vehicle} averageRating={averageRating} reviewCount={totalReviews} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <CarDetailGallery vehicle={serializableVehicle as Vehicle} />
                 <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{vehicle.description}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="border rounded-lg p-6">
                    <h3 className="text-2xl font-bold mb-4">Overview</h3>
                    <div className="flex flex-col gap-2">
                        {overview.map(spec => <SpecItem key={spec.label} {...spec} />)}
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-12">
            <Tabs defaultValue="specifications" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-2">
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                <TabsContent value="specifications">
                    <Card>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                           <div className="space-y-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2"><Zap className="h-5 w-5" />Performance & Safety</h3>
                                <div className="space-y-4">
                                    {performanceAndSafety.map(spec => <SpecItem key={spec.label} {...spec} />)}
                                </div>
                            </div>
                             <div className="space-y-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2"><Ruler className="h-5 w-5" />Technical Specification</h3>
                                <div className="space-y-4">
                                    {techSpecs.map(spec => <SpecItem key={spec.label} {...spec} />)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features">
                    <Card>
                        <CardContent className="p-6 space-y-8">
                            <FeatureList title="Exterior Features" features={vehicle.exteriorFeatures} icon={<Car />} />
                            <FeatureList title="Interior Features" features={vehicle.interiorFeatures} icon={<Users />} />
                            <FeatureList title="Comfort & Convenience" features={vehicle.comfortAndConvenience} icon={<Thermometer />} />
                            <FeatureList title="Safety Features" features={vehicle.safetyFeatures} icon={<ShieldCheck />} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        <div className="mt-12">
            <ReviewSection 
                itemId={vehicle.id}
                itemType="vehicle"
                itemTitle={vehicle.name}
                initialReviews={serializableReviews as Review[]}
            />
        </div>
    </div>
    </>
  );
}
