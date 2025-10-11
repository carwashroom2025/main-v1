
import { Suspense } from "react";
import Image from "next/image";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
         <Image
            src="https://images.unsplash.com/photo-1587750059638-e7e8c43b99fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHx2aW50YWdlJTIwY2FyfGVufDB8fHx8MTc1ODUwODE4N3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Vintage car"
            fill
            className="object-cover"
            priority
            data-ai-hint="vintage car"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Our Blog</h1>
          <p className="mt-2 text-lg text-white/80">
            News, tips, and stories from the automotive world.
          </p>
        </div>
      </div>
      <div className="container py-12">
        {children}
      </div>
    </>
  );
}
