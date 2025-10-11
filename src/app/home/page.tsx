
import { Hero } from '@/components/home/hero-section';
import { FeaturedCars } from '@/components/home/featured-cars';
import { WhyChooseUs } from '@/components/home/why-choose-us';
import { FeaturedBusinesses } from '@/components/home/featured-businesses';
import { AllServices } from '@/components/home/all-services';
import { RecentBlogPosts } from '@/components/home/recent-blog-posts';
import { AnimatedSection } from '@/components/shared/animated-section';

export default function Home() {
  return (
    <>
      <Hero />
      <AnimatedSection>
        <AllServices />
      </AnimatedSection>
      <AnimatedSection>
        <FeaturedBusinesses />
      </AnimatedSection>
      <AnimatedSection>
        <FeaturedCars />
      </AnimatedSection>
      <AnimatedSection>
        <RecentBlogPosts />
      </AnimatedSection>
      <AnimatedSection>
        <WhyChooseUs />
      </AnimatedSection>
    </>
  );
}
