
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { blogAuthors } from '@/lib/blog-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

type AuthorBioProps = {
  author: string;
};

export function AuthorBio({ author }: AuthorBioProps) {
  const authorDetails = blogAuthors.find((a) => a.name === author);

  if (!authorDetails) {
    return null;
  }

  const authorImage = PlaceHolderImages.find((img) => img.id === authorDetails.imageId);

  return (
    <div className="flex items-start gap-6 rounded-lg bg-secondary p-6">
      {authorImage && (
        <Avatar className="h-20 w-20">
          <AvatarImage src={authorImage.imageUrl} alt={authorDetails.name} />
          <AvatarFallback>{authorDetails.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1">
        <h4 className="text-lg font-bold">{authorDetails.name}</h4>
        <p className="mt-2 text-muted-foreground">{authorDetails.bio}</p>
        <div className="mt-4 flex items-center gap-2">
          {authorDetails.socials.twitter && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={authorDetails.socials.twitter} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
          )}
          {authorDetails.socials.linkedin && (
             <Button variant="ghost" size="icon" asChild>
              <Link href={authorDetails.socials.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
