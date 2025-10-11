
'use client';

import { useState, useEffect } from 'react';
import { Twitter, Facebook, Linkedin, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost } from '@/lib/types';

type ShareButtonsProps = {
  post: BlogPost;
};

export function ShareButtons({ post }: ShareButtonsProps) {
  const { toast } = useToast();
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const shareText = `Check out this article: ${post.title}`;

  const socialShares = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.excerpt)}`,
    },
  ];

  const copyToClipboard = () => {
    if (!pageUrl) return;
    navigator.clipboard.writeText(pageUrl)
      .then(() => {
        toast({
          title: 'Link Copied!',
          description: 'The page URL has been copied to your clipboard.',
        });
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast({
          title: 'Failed to Copy',
          description: 'Could not copy the link to your clipboard.',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share this post:</span>
      {socialShares.map((social) => (
        <Button key={social.name} variant="outline" size="icon" asChild>
          <a href={social.url} target="_blank" rel="noopener noreferrer" onClick={(e) => !pageUrl && e.preventDefault()}>
            <social.icon className="h-4 w-4" />
            <span className="sr-only">Share on {social.name}</span>
          </a>
        </Button>
      ))}
       <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!pageUrl}>
          <Link2 className="h-4 w-4" />
          <span className="sr-only">Copy link</span>
        </Button>
    </div>
  );
}
