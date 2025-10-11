
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us | Carwashroom',
  description: 'Learn more about Carwashroom, our mission, and our team.',
};

export default function AboutPage() {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwb3JzY2hlfGVufDB8fHx8MTc1ODU4NjY5Nnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="A high-performance sports car"
            fill
            className="object-cover"
            priority
            data-ai-hint="sports car"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">About Carwashroom</h1>
          <p className="mt-2 text-lg text-white/80">
            Your trusted partner in the automotive world. Connecting you with the best cars, services, and information.
          </p>
        </div>
      </div>
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
            <p className="text-muted-foreground text-lg">
              At Carwashroom, our mission is to simplify the car ownership experience. Whether you're buying, selling, or servicing your vehicle, we provide a comprehensive and trustworthy platform to connect you with the resources you need. We believe in transparency, quality, and community.
            </p>
            <p className="text-muted-foreground">
              We are dedicated to creating a seamless ecosystem for car enthusiasts and everyday drivers alike. By leveraging technology and fostering a network of verified partners, we aim to be the most reliable resource in the automotive industry.
            </p>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwb3JzY2hlfGVufDB8fHx8MTc1ODU4NjY5Nnww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="A team of mechanics working together"
              fill
              className="object-cover"
              data-ai-hint="team work"
            />
          </div>
        </div>
      </div>
    </>
  );
}
