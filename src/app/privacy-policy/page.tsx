
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Privacy Policy | Carwashroom',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1555529771-838f8c8ee21a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjYXIlMjBsaWdodHN8ZW58MHx8fHwxNzU4ODg1ODQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Car headlights"
            fill
            className="object-cover"
            priority
            data-ai-hint="car lights"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-lg text-white/80">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="container py-16 md:py-24 max-w-4xl mx-auto">
        <div className="prose prose-lg dark:prose-invert">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Carwashroom. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
            </li>
          </ul>

          <h2>3. Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Email you regarding your account or order.</li>
            <li>Enable user-to-user communications.</li>
            <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
          </ul>

          <h2>4. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: privacy@carwashroom.com
          </p>
        </div>
      </div>
    </>
  );
}
