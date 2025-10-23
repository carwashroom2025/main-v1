
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategories } from '@/lib/firebase/firestore';
import type { Category } from '@/lib/types';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import Image from 'next/image';

const categoryImageMap: { [key: string]: string } = {
  'Car Wash & Detailing': 'category-car-wash',
  'Service Centres': 'category-service-centers',
  'Dealerships': 'category-car-dealers',
  'Pre Owned Car Dealers': 'category-used-cars',
  'Showrooms': 'category-showrooms',
  'Insurance & Protection': 'category-car-insurance',
  'Car Rentals': 'category-rent-a-car',
  'Parts & Accessories': 'category-spare-parts',
  'Customs & Modifications': 'category-modifiers',
  'Other Services': 'others-category',
};

export async function AllServices() {
  const categoriesFromDb = await getCategories();
        
  const otherServicesCategory = categoriesFromDb.find(c => c.name === 'Other Services');
  const sortedCategories = categoriesFromDb
      .filter(c => c.name !== 'Other Services')
      .sort((a, b) => a.name.localeCompare(b.name));

  if (otherServicesCategory) {
      sortedCategories.push(otherServicesCategory);
  }
  
  const categories = sortedCategories;

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold mb-2">[ OUR SERVICES ]</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">EXPLORE ALL SERVICES</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            From routine maintenance to custom modifications, find trusted automotive professionals for all your needs.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((category) => {
              const categoryUrl = `/services?categories=${encodeURIComponent(category.name)}`;
              const imageId = categoryImageMap[category.name];
              const image = category.imageUrl || PlaceHolderImages.find(img => img.id === imageId)?.imageUrl;

              return (
                  <Link href={categoryUrl} scroll={false} key={category.id} className="group relative block rounded-lg overflow-hidden h-48 transition-all duration-300">
                      {image && (
                           <Image 
                              src={image} 
                              alt={category.name} 
                              fill 
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              data-ai-hint={PlaceHolderImages.find(img => img.id === imageId)?.imageHint}
                          />
                      )}
                      <div className="absolute inset-0 bg-black/50 transition-colors group-hover:bg-black/70" />
                      <div className="absolute bottom-0 left-0 p-4">
                          <h3 className="font-semibold text-lg text-white">{category.name}</h3>
                      </div>
                       <div className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-6 w-6" />
                      </div>
                  </Link>
              );
          })}
        </div>
      </div>
    </section>
  );
}
