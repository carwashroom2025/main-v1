
import Image from "next/image";

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1690633129658-59a39ed32368?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Support"
            fill
            className="object-cover"
            priority
            data-ai-hint="abstract pattern"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-2 text-lg text-white/80">
            Find answers to common questions about our services and platform.
          </p>
        </div>
      </div>
      {children}
    </>
  );
}
