

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
        {/* The hero image is removed to match the new design which doesn't have one on the blog page */}
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Our Blog</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            News, tips, and stories from the automotive world.
          </p>
        </div>
      </div>
      {children}
    </>
  );
}
