
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Terms of Service | Carwashroom',
};

export default function TermsPage() {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1503729579475-0690081195a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxkcml2aW5nJTIwcm9hZHxlbnwwfHx8fDE3NTg4ODU4NDF8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="A car on a road"
            fill
            className="object-cover"
            priority
            data-ai-hint="driving road"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-lg text-white/80">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="container py-16 md:py-24 max-w-4xl mx-auto">
        <div className="prose prose-lg dark:prose-invert">
          <h2>1. Agreement to Terms</h2>
          <p>
            By using our services, you agree to be bound by these Terms. If you do not agree to be bound by these Terms, do not use the services.
          </p>

          <h2>2. Your Account</h2>
          <p>
            You may be required to create an account to access some of our services. You are responsible for safeguarding your account, so use a strong password and limit its use to this account. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above.
          </p>

          <h2>3. Content on the Services</h2>
          <p>
            You are responsible for your use of the Services and for any Content you provide, including compliance with applicable laws, rules, and regulations. You should only provide Content that you are comfortable sharing with others.
          </p>
          
          <h2>4. Prohibited Conduct</h2>
          <p>
            You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the Service in any medium, including without limitation by any automated or non-automated “scraping”; (ii) using any automated system, including without limitation “robots,” “spiders,” “offline readers,” etc., to access the Service in a manner that sends more request messages to the servers than a human can reasonably produce in the same period of time by using a conventional on-line web browser.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at: legal@carwashroom.com
          </p>
        </div>
      </div>
    </>
  );
}
