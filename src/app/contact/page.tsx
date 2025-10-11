
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Twitter, Facebook, Linkedin, Instagram } from "lucide-react"
import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="bg-background text-foreground">
       <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
              src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjb250YWN0fGVufDB8fHx8MTc1ODg4NTg0MXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Contact us"
              fill
              className="object-cover"
              priority
              data-ai-hint="contact"
          />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="mt-2 text-lg text-white/80">
            We'd love to hear from you. Here's how you can reach us.
          </p>
        </div>
      </div>
      <div className="container mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="bg-secondary p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">Drop Us a Line</h2>
            <p className="text-muted-foreground mb-8 text-sm">
              Your email address will not be published. Required fields are marked *
            </p>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="sr-only">Your Name</label>
                <Input id="name" type="text" placeholder="Your Name" className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary" required />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Your Email</label>
                <Input id="email" type="email" placeholder="Your Email" className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary" required />
              </div>
              <div>
                <label htmlFor="comment" className="sr-only">Your Comment</label>
                <Textarea id="comment" placeholder="Your Comment" className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary" rows={4} required />
              </div>
              <Button type="submit" size="lg" className="rounded-full">Get in Touch</Button>
            </form>
          </div>

          <div className="space-y-8 pt-8">
            <div>
              <p className="text-primary font-semibold mb-2">[ GET IN TOUCH WITH US ]</p>
              <h2 className="text-4xl font-bold tracking-tighter">LET'S START WORKING TOGETHER</h2>
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase mb-2">Location</h3>
              <p className="text-muted-foreground">27 Division St, New York, NY 10002, USA</p>
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase mb-2">Contacts</h3>
              <p className="text-muted-foreground">contact@carwashroom.com</p>
              <p className="text-muted-foreground">+1 (800) 123 456 78</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary"><Twitter /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Facebook /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Instagram /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
