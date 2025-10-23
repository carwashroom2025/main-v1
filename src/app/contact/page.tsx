
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Twitter, Facebook, Linkedin, Instagram } from "lucide-react"
import Image from "next/image";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1200 1227" fill="currentColor" {...props}>
        <g clipPath="url(#clip0_1_2)">
            <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/>
        </g>
        <defs>
            <clipPath id="clip0_1_2">
                <rect width="1200" height="1227" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg style={{enableBackground:"new 0 0 64 64"}} version="1.1" viewBox="0 0 64 64" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M55.1,19.2v6c-0.5,0.1-1.1,0.1-1.7,0.1c-4.5,0-8.7-1.7-11.9-4.4v19.8c0,4-1.3,7.8-3.6,10.8c-3.3,4.4-8.4,7.2-14.2,7.2   c-4.7,0-9-1.9-12.2-4.9c-1.7-2.8-2.7-6-2.7-9.5c0-9.7,7.7-17.6,17.3-17.9l0,6.6c-0.7-0.2-1.5-0.3-2.2-0.3c-4.4,0-8,3.7-8,8.2   c0,2.7,1.3,5.2,3.4,6.6c1.1,3.1,4.1,5.4,7.5,5.4c4.4,0,8-3.7,8-8.2V5.9h7.3c0.7,2.4,2,4.5,3.8,6.1C47.7,15.6,51.1,18.3,55.1,19.2z" fill="#00F7EF"></path>
        <g>
            <g>
                <path d="M26.1,22.8l0,3.4c-9.6,0.3-17.3,8.2-17.3,17.9c0,3.5,1,6.7,2.7,9.5C8.1,50.3,6,45.7,6,40.5      c0-9.9,8-17.9,17.8-17.9C24.6,22.6,25.4,22.7,26.1,22.8z" fill="#FF004F"></path>
                <path d="M42.1,5.9h-7.3v38.6c0,4.5-3.6,8.2-8,8.2c-3.5,0-6.4-2.2-7.5-5.4c1.3,0.9,2.9,1.5,4.6,1.5      c4.4,0,8-3.6,8-8.1V2h9.7v0.2c0,0.4,0,0.8,0.1,1.2C41.7,4.2,41.9,5.1,42.1,5.9z" fill="currentColor"></path>
            </g>
            <path d="M55.1,15.5C55.1,15.5,55.1,15.5,55.1,15.5v3.6c-4-0.8-7.4-3.5-9.3-7.1C48.3,14.3,51.5,15.6,55.1,15.5z" fill="#FF004F"></path>
        </g>
    </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg style={{fillRule:"evenodd",clipRule:"evenodd",strokeLinejoin:"round",strokeMiterlimit:2}} version="1.1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M374.245,285.825l14.104,-91.961l-88.233,0l0,-59.677c0,-25.159 12.325,-49.682 51.845,-49.682l40.117,0l0,-78.291c0,0 -36.408,-6.214 -71.214,-6.214c-72.67,0 -120.165,44.042 -120.165,123.775l0,70.089l-80.777,0l0,91.961l80.777,0l0,222.31c16.197,2.542 32.798,3.865 49.709,3.865c16.911,0 33.512,-1.323 49.708,-3.865l0,-222.31l74.129,0Z" style={{fill:"currentColor",fillRule:"nonzero"}}/>
    </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg style={{enableBackground:"new 0 0 64 64"}} version="1.1" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M50,52H14C7.4,52,2,46.6,2,40V24c0-6.6,5.4-12,12-12h36c6.6,0,12,5.4,12,12v16C62,46.6,56.6,52,50,52z" fill="#C2191E"/>
        <polygon points="24,42 24,22 44,32  " fill="#FFFFFF"/>
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

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
          <div className="bg-card p-8 rounded-lg shadow-lg">
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
              <p className="text-muted-foreground">202 Delma House Building, King Faisal Street, Sharjah, UAE</p>
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase mb-2">Contacts</h3>
              <p className="text-muted-foreground">ask@carwashroom.net</p>
              <p className="text-muted-foreground">0552405099</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary"><InstagramIcon className="h-6 w-6" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><FacebookIcon className="h-6 w-6" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><XIcon className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><TikTokIcon className="h-6 w-6" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><YoutubeIcon className="h-6 w-6" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
