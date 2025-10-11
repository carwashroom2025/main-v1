import { Car, Gem, ShieldCheck, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Trusted by Thousands',
    description: 'We have a strong community of satisfied users and business owners who trust our platform for their automotive needs.',
  },
  {
    icon: <Car className="h-8 w-8 text-primary" />,
    title: 'Wide Selection of Vehicles',
    description: 'From luxury sedans to rugged SUVs, we offer a diverse range of vehicles to suit every lifestyle and budget.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Verified Businesses',
    description: 'All businesses on our platform are verified to ensure you receive quality service from trusted professionals.',
  },
  {
    icon: <Gem className="h-8 w-8 text-primary" />,
    title: 'Exclusive Deals',
    description: 'Get access to exclusive deals and offers on cars and services that you won\'t find anywhere else.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="container py-12 md:py-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Why Choose Us?</h2>
        <p className="mt-2 text-muted-foreground">
          We are committed to providing the best automotive directory experience.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="text-center">
            <CardHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {feature.icon}
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
