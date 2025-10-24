
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, User } from '@/lib/types';
import { addBlogPost, updateBlogPost, getUsers, getPopularTags } from '@/lib/firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { blogCategories } from '@/lib/blog-data';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { uploadFile } from '@/lib/firebase/storage';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

type BlogPostFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  post: BlogPost | null;
  onDataChange: () => void;
};

const initialFormData: Partial<BlogPost> = {
  title: '',
  slug: '',
  content: '',
  author: '',
  authorId: '',
  imageUrl: '',
  excerpt: '',
  category: '',
  tags: [],
  readTime: 5,
  views: 0,
  date: format(new Date(), 'yyyy-MM-dd'),
};

export function BlogPostForm({ isOpen, setIsOpen, post, onDataChange }: BlogPostFormProps) {
  const [formData, setFormData] = useState<Partial<BlogPost>>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<User[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!post;
  const isAdmin = user && ['Moderator', 'Administrator'].includes(user.role);
  const [tagsString, setTagsString] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchData() {
      if (isOpen) {
        const [allUsers, fetchedPopularTags] = await Promise.all([
          getUsers(),
          getPopularTags(10)
        ]);
        const authorUsers = allUsers.filter(u => ['Author', 'Moderator', 'Administrator'].includes(u.role));
        setAuthors(authorUsers);
        setPopularTags(fetchedPopularTags);
      }
    }
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
        if (post) {
            setFormData({
              ...initialFormData,
              ...post,
              date: post.date ? format(new Date(post.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            });
            setTagsString(post.tags?.join(', ') || '');
        } else {
            setFormData({
                ...initialFormData,
                author: user?.name || '',
                authorId: user?.id || '',
            });
            setTagsString('');
        }
    }
  }, [post, isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
        const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        setFormData(prev => ({ ...prev, title: value, slug: slug }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'author') {
        const selectedAuthor = authors.find(a => a.name === value);
        setFormData(prev => ({ ...prev, author: value, authorId: selectedAuthor?.id }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsString(e.target.value);
  }

  const handlePopularTagClick = (tag: string) => {
    const currentTags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    if (currentTags.includes(tag)) {
        setTagsString(currentTags.filter(t => t !== tag).join(', '));
    } else {
        setTagsString([...currentTags, tag].join(', '));
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    try {
        const url = await uploadFile(file, 'blog-images', setUploadProgress);
        setFormData(prev => ({...prev, imageUrl: url}));
        toast({ title: "Image Uploaded", description: "The image has been successfully uploaded." });
    } catch (error: any) {
        toast({ title: "Upload Failed", description: error.message, variant: 'destructive'});
    } finally {
        setUploadProgress(null);
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave: Partial<BlogPost> = {
        ...formData,
        tags: tagsString.split(',').map(t => t.trim()).filter(Boolean),
        readTime: Number(formData.readTime) || 0,
        date: formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      };

      if (post) {
        await updateBlogPost(post.id, dataToSave as BlogPost);
        toast({
          title: 'Post Updated',
          description: `"${formData.title}" has been successfully updated.`,
        });
      } else {
        await addBlogPost(dataToSave as Omit<BlogPost, 'id'>);
        toast({
          title: 'Post Added',
          description: `"${formData.title}" has been successfully added.`,
        });
      }
      onDataChange();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to save post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="w-1 h-5 bg-destructive mr-3"></span>
            {post ? 'Edit Post' : 'Create New Blog Post'}
          </DialogTitle>
          <DialogDescription className="pl-4">
            {post ? 'Update the details of the blog post.' : 'Fill in the details below to create a new blog post for your automotive blog.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-6">
          <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required placeholder="Enter blog post title" />
          </div>
           <div className="space-y-2">
              <Label htmlFor="excerpt">Description</Label>
              <Textarea id="excerpt" name="excerpt" value={formData.excerpt || ''} onChange={handleChange} placeholder="Enter a brief description of your blog post" />
              <p className="text-xs text-muted-foreground">Plain text summary for preview cards</p>
          </div>
          <div className="space-y-2">
              <Label htmlFor="content">HTML Content <span className="text-destructive">*</span></Label>
              <Textarea id="content" name="content" value={formData.content || ''} onChange={handleChange} rows={8} required placeholder="Enter the full blog post content with HTML tags (e.g., <p>Paragraph</p>, <h2>Heading</h2>, <ul><li>List item</li></ul>)" />
               <p className="text-xs text-muted-foreground">Full blog post content with HTML formatting</p>
          </div>
          <div className="space-y-2">
            <Label>Featured Image <span className="text-destructive">*</span></Label>
             <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                    <Input 
                        id="imageUrl" 
                        name="imageUrl" 
                        value={formData.imageUrl || ''} 
                        onChange={handleChange}
                        placeholder="https://images.unsplash.com/..."
                    />
                     <label
                        htmlFor="image-upload"
                        className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                        <div className="p-2 rounded-md hover:bg-muted">
                             <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </label>
                    <Input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                </div>
                 {formData.imageUrl && (
                    <div className="relative group w-20 h-14 flex-shrink-0">
                       <Image src={formData.imageUrl} alt="Featured Image" layout="fill" className="object-cover rounded-md" />
                       <Button
                           type="button"
                           variant="destructive"
                           size="icon"
                           className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100"
                           onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))}
                       >
                           <X className="h-3 w-3" />
                       </Button>
                    </div>
                )}
             </div>
             <p className="text-xs text-muted-foreground">Optional: Add a URL for the featured image or upload one.</p>
             {uploadProgress !== null && <Progress value={uploadProgress} className="w-full mt-2" />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                  <Select name="category" value={formData.category || ''} onValueChange={(value) => handleSelectChange('category', value)} required>
                      <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                          {blogCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="readTime">Read Time <span className="text-destructive">*</span></Label>
                  <Input id="readTime" name="readTime" type="number" value={formData.readTime || ''} onChange={handleChange} required placeholder="e.g., 5 min read" />
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => {
                    const currentTags = tagsString.split(',').map(t => t.trim());
                    const isSelected = currentTags.includes(tag);
                    return (
                        <Badge
                            key={tag}
                            variant={isSelected ? "default" : "secondary"}
                            onClick={() => handlePopularTagClick(tag)}
                            className="cursor-pointer"
                        >
                            {tag}
                        </Badge>
                    )
                })}
              </div>
              <p className="text-xs text-muted-foreground">Or add a custom tag:</p>
              <Input id="tags" name="tags" value={tagsString} onChange={handleTagsChange} placeholder="Type custom tags, comma separated" />
          </div>
          
          <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading || uploadProgress !== null}>
                  {loading ? 'Saving...' : (uploadProgress !== null ? 'Uploading...' : (isEditMode ? 'Update Post' : 'Create Post'))}
              </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
