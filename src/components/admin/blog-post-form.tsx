
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
import { addBlogPost, updateBlogPost, getUsers } from '@/lib/firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { blogCategories } from '@/lib/blog-data';

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
  date: format(new Date(), 'yyyy-MM-dd'),
};

export function BlogPostForm({ isOpen, setIsOpen, post, onDataChange }: BlogPostFormProps) {
  const [formData, setFormData] = useState<Partial<BlogPost>>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<User[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!post;
  const isAdmin = user && ['Admin', 'Owner'].includes(user.role);
  const [tagsString, setTagsString] = useState('');
  
  useEffect(() => {
    async function fetchAuthors() {
      if (isOpen) {
        const allUsers = await getUsers();
        const authorUsers = allUsers.filter(u => ['Author', 'Admin', 'Owner'].includes(u.role));
        setAuthors(authorUsers);
      }
    }
    fetchAuthors();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
        if (post) {
            setFormData({
              ...initialFormData,
              ...post,
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        tags: tagsString.split(',').map(t => t.trim()).filter(Boolean),
        readTime: Number(formData.readTime)
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? 'Edit Post' : 'Add New Post'}</DialogTitle>
          <DialogDescription>
            {post ? 'Update the details of the blog post.' : 'Fill in the details for the new blog post.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" value={formData.slug || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" value={formData.category || ''} onValueChange={(value) => handleSelectChange('category', value)}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {blogCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" name="tags" value={tagsString} onChange={handleTagsChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Select name="author" value={formData.author || ''} onValueChange={(value) => handleSelectChange('author', value)} disabled={!isAdmin}>
                        <SelectTrigger id="author">
                            <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                             {authors.map(author => (
                                <SelectItem key={author.id} value={author.name}>{author.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="readTime">Read Time (minutes)</Label>
                    <Input id="readTime" name="readTime" type="number" value={formData.readTime || 0} onChange={handleChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea id="excerpt" name="excerpt" value={formData.excerpt || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="content">Content (HTML allowed)</Label>
                    <Textarea id="content" name="content" value={formData.content || ''} onChange={handleChange} rows={10} />
                </div>
            </div>
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
