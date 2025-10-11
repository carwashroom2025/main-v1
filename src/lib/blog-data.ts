
import type { BlogPost } from './types';

export const blogAuthors = [
    {
        name: 'Jane Doe',
        imageId: 'author-1',
        bio: 'Jane Doe is an automotive journalist with over a decade of experience covering the latest trends and technologies in the car industry. She has a passion for electric vehicles and sustainable transportation.',
        socials: {
            twitter: '#',
            linkedin: '#',
        }
    },
    {
        name: 'John Smith',
        imageId: 'author-1',
        bio: 'John Smith is a master mechanic and classic car enthusiast. With over 20 years of hands-on experience, he shares his knowledge to help others maintain and restore their vintage automobiles.',
        socials: {
            twitter: '#',
            linkedin: '#',
        }
    }
]

export const blogCategories = [
    "Car Knowledge & guides",
    "Maintenance & Care",
    "Reviews & Comparisons",
    "Modifications & customization",
    "Industry News & Trends",
    "Driving & Ownerships",
    "History & Heritage",
    "Electric & Future Mobility"
];

export const blogPosts: BlogPost[] = [];
