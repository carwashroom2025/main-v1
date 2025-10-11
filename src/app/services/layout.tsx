
import Image from "next/image";

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxtZWNoYW5pY3xlbnwwfHx8fDE3NTg1ODI0NTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Mechanic working on a car"
          fill
          className="object-cover"
          priority
          data-ai-hint="mechanic service"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Our Services</h1>
          <p className="mt-2 text-lg text-white/80">
            Find the best automotive services in your area.
          </p>
        </div>
      </div>
      <div className="container py-12">
        {children}
      </div>
    </>
  );
}
