
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Business, Category } from '@/lib/types';
import { addBusiness, updateBusiness } from '@/lib/firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '@/context/auth-context';
import { locations } from '@/lib/car-data';
import { Timestamp } from 'firebase/firestore';

type BusinessFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  business: Business | null;
  onDataChange: () => void;
  featuredCount?: number;
  categories: Category[];
};

const FEATURED_LIMIT = 3;

const initialFormData: Partial<Omit<Business, 'id' | 'createdAt'>> = {
  title: '',
  category: '',
  description: '',
  location: '',
  address: '',
  contact: {
    phone: '',
    email: '',
    website: '',
  },
  socials: {
    twitter: '',
    facebook: '',
    instagram: '',
  },
  ownerId: '',
  verified: true,
  featured: false,
  status: 'pending',
  mainImageUrl: '',
  galleryImageUrls: [],
};

export function BusinessForm({ isOpen, setIsOpen, business, onDataChange, featuredCount = 0, categories }: BusinessFormProps) {
  const [formData, setFormData] = useState<Partial<Business>>(initialFormData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user && ['Admin', 'Owner'].includes(user.role);
  const [galleryUrlsText, setGalleryUrlsText] = useState('');
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);


  useEffect(() => {
    if (categories) {
        const otherServicesCategory = categories.find(c => c.name === 'Other Services');
        const alphabetizedCategories = categories
            .filter(c => c.name !== 'Other Services')
            .sort((a, b) => a.name.localeCompare(b.name));

        if (otherServicesCategory) {
            alphabetizedCategories.push(otherServicesCategory);
        }
        setSortedCategories(alphabetizedCategories);
    }
  }, [categories]);

  useEffect(() => {
    if (isOpen) {
        if (business) {
            setFormData(business);
            setGalleryUrlsText(business.galleryImageUrls?.join(',\n') || '');
        } else {
            setFormData({
                ...initialFormData,
                ownerId: user?.id || '',
                ownerName: user?.name || '',
                status: isAdmin ? 'approved' : 'pending',
                verified: isAdmin, // Auto-verify if an admin is creating it
            });
            setGalleryUrlsText('');
        }
    }
  }, [business, isOpen, user, isAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [name]: value },
    }));
  };
  
   const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [name]: value },
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (checked: boolean) => {
    if (checked && !business?.featured && featuredCount >= FEATURED_LIMIT) {
        toast({
            title: "Featured Limit Reached",
            description: `You can only feature up to ${FEATURED_LIMIT} businesses. Please un-feature another business first.`,
            variant: "destructive"
        });
        return;
    }
    setFormData(prev => ({...prev, featured: !!checked}));
  }
  
  const handleGalleryUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGalleryUrlsText(e.target.value);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const galleryImageUrls = galleryUrlsText.split(',').map(url => url.trim()).filter(url => url);

    const dataToSave: Partial<Business> = {
        ...formData,
        galleryImageUrls
    };

    try {
      if (business) {
        await updateBusiness(business.id, dataToSave as Business);
        toast({
          title: 'Business Updated',
          description: `"${formData.title}" has been successfully updated.`,
        });
      } else {
        await addBusiness(dataToSave as Omit<Business, 'id'>);
        toast({
          title: 'Business Added',
          description: `"${formData.title}" has been successfully added.`,
        });
      }
      onDataChange();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to save business:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save business. Please try again.',
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
          <DialogTitle>{business ? 'Edit Business' : 'Add New Business'}</DialogTitle>
          <DialogDescription>
            {business ? 'Update the details of the business listing.' : 'Fill in the details for the new business listing.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Business Name</Label>
                <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" value={formData.category || ''} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortedCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="location">Country</Label>
                    <Select name="location" value={formData.location || ''} onValueChange={(value) => handleSelectChange('location', value)}>
                        <SelectTrigger id="location">
                            <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.map(loc => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={formData.contact?.phone || ''} onChange={handleContactChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.contact?.email || ''} onChange={handleContactChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" value={formData.contact?.website || ''} onChange={handleContactChange} placeholder="example.com" />
                </div>
            </div>
             <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Social Media (Optional)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter URL</Label>
                        <Input id="twitter" name="twitter" value={formData.socials?.twitter || ''} onChange={handleSocialsChange} placeholder="https://twitter.com/yourhandle" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook URL</Label>
                        <Input id="facebook" name="facebook" value={formData.socials?.facebook || ''} onChange={handleSocialsChange} placeholder="https://facebook.com/yourpage" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram URL</Label>
                        <Input id="instagram" name="instagram" value={formData.socials?.instagram || ''} onChange={handleSocialsChange} placeholder="https://instagram.com/yourhandle" />
                    </div>
                 </div>
            </div>
             <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Image URLs</h3>
                <div className="space-y-2">
                    <Label htmlFor="mainImageUrl">Main Image URL</Label>
                    <Input id="mainImageUrl" name="mainImageUrl" value={formData.mainImageUrl || ''} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="galleryImageUrls">Gallery Image URLs (comma-separated)</Label>
                    <Textarea id="galleryImageUrls" name="galleryImageUrls" value={galleryUrlsText} onChange={handleGalleryUrlsChange} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
                </div>
            </div>

            {isAdmin && (
                <div className="space-y-4">
                     <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Admin Settings</h3>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                        id="verified"
                        checked={formData.verified}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, verified: !!checked}))}
                        />
                        <Label htmlFor="verified">Verified Listing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => handleFeatureChange(checked as boolean)}
                        />
                        <Label htmlFor="featured">Feature on Homepage</Label>
                    </div>
                </div>
            )}
            
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
