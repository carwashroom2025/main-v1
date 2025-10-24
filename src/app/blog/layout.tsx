
import { Suspense } from "react";
import Image from "next/image";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden bg-background">
        <Image
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Blog hero image"
            fill
            className="object-cover"
            priority
            data-ai-hint="sports car"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight text-white">Our Blog</h1>
          <p className="mt-2 text-lg text-white/80">
            News, tips, and stories from the automotive world.
          </p>
        </div>
      </div>
      {children}
    </>
  );
}
