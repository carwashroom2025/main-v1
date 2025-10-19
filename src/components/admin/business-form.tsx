

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
import { uploadFile } from '@/lib/firebase/storage';
import { Progress } from '../ui/progress';
import { Upload, X, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

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
  servicesOffered: [],
  openingHours: '',
  closingHours: '',
};

export function BusinessForm({ isOpen, setIsOpen, business, onDataChange, featuredCount = 0, categories }: BusinessFormProps) {
  const [formData, setFormData] = useState<Partial<Business>>(initialFormData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user && ['Moderator', 'Administrator', 'Author'].includes(user.role);
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number} | null>(null);


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
        } else {
            setFormData({
                ...initialFormData,
                ownerId: user?.id || '',
                ownerName: user?.name || '',
                status: isAdmin ? 'approved' : 'pending',
                verified: isAdmin,
            });
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
  
  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...(formData.servicesOffered || [])];
    newServices[index] = value;
    setFormData(prev => ({ ...prev, servicesOffered: newServices }));
  }

  const handleAddService = () => {
    const services = formData.servicesOffered || [];
    if (services.length < 6) {
        setFormData(prev => ({...prev, servicesOffered: [...services, '']}));
    } else {
        toast({
            title: "Limit Reached",
            description: "You can add a maximum of 6 services.",
            variant: "destructive"
        });
    }
  }
  
  const handleRemoveService = (index: number) => {
      const newServices = (formData.servicesOffered || []).filter((_, i) => i !== index);
      setFormData(prev => ({...prev, servicesOffered: newServices}));
  }

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
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'mainImageUrl' | 'galleryImageUrls') => {
      const files = e.target.files;
      if (!files) return;

      const newUploads: {[key: string]: number} = {};
      Array.from(files).forEach(file => newUploads[file.name] = 0);
      setUploadProgress(prev => ({...prev, ...newUploads}));

      try {
        const uploadPromises = Array.from(files).map(file => 
            uploadFile(file, 'business-images', (progress) => {
                setUploadProgress(prev => ({...prev, [file.name]: progress}))
            })
        );
        const urls = await Promise.all(uploadPromises);

        if(field === 'mainImageUrl') {
            setFormData(prev => ({...prev, mainImageUrl: urls[0]}));
        } else {
            setFormData(prev => ({...prev, galleryImageUrls: [...(prev.galleryImageUrls || []), ...urls]}));
        }
        toast({ title: "Images Uploaded", description: "The image(s) have been successfully uploaded." });
      } catch (error: any) {
          toast({ title: "Upload Failed", description: error.message, variant: 'destructive'});
      } finally {
          setUploadProgress(null);
      }
  };
  
  const removeImage = (url: string, field: 'mainImageUrl' | 'galleryImageUrls') => {
      if(field === 'mainImageUrl') {
          setFormData(prev => ({...prev, mainImageUrl: ''}));
      } else {
          setFormData(prev => ({...prev, galleryImageUrls: prev.galleryImageUrls?.filter(u => u !== url)}));
      }
  }

  const handleApprovalChange = (checked: boolean) => {
    setFormData(prev => ({
        ...prev, 
        verified: !!checked,
        status: checked ? 'approved' : 'pending'
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (business) {
        await updateBusiness(business.id, formData as Business);
        toast({
          title: 'Business Updated',
          description: `"${formData.title}" has been successfully updated.`,
        });
      } else {
        await addBusiness(formData as Omit<Business, 'id'>);
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
          <Accordion type="multiple" defaultValue={['basic-info']} className="w-full">
            <AccordionItem value="basic-info">
              <AccordionTrigger>Basic Information</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
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
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="location-contact">
              <AccordionTrigger>Location & Contact</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
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
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="hours-socials">
              <AccordionTrigger>Hours & Socials</AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="openingHours">Opening Hours</Label>
                        <Input id="openingHours" name="openingHours" type="time" value={formData.openingHours || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="closingHours">Closing Hours</Label>
                        <Input id="closingHours" name="closingHours" type="time" value={formData.closingHours || ''} onChange={handleChange} />
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="services-offered">
                <AccordionTrigger>Services Offered</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Services (up to 6)</Label>
                        <div className="space-y-2">
                            {(formData.servicesOffered || []).map((service, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        value={service}
                                        onChange={(e) => handleServiceChange(index, e.target.value)}
                                        placeholder={`Service #${index + 1}`}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveService(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {(formData.servicesOffered?.length || 0) < 6 && (
                            <Button type="button" variant="outline" onClick={handleAddService} className="mt-2">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Service
                            </Button>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="images">
              <AccordionTrigger>Images</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label>Main Image</Label>
                    {formData.mainImageUrl ? (
                        <div className="relative group w-48 h-32">
                           <Image src={formData.mainImageUrl} alt="Main business" fill className="object-cover rounded-md" />
                           <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeImage(formData.mainImageUrl!, 'mainImageUrl')}><X className="h-4 w-4" /></Button>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="main-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50"><Upload className="h-8 w-8 text-muted-foreground" /><span className="text-sm text-muted-foreground">Click to upload</span></label>
                            <Input id="main-image-upload" type="file" className="sr-only" onChange={(e) => handleImageUpload(e, 'mainImageUrl')} accept="image/*" />
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label>Gallery Images</Label>
                    <div className="flex flex-wrap gap-2">
                        {(formData.galleryImageUrls || []).map(url => (
                            <div key={url} className="relative group w-24 h-24">
                                <Image src={url} alt="Gallery image" fill className="object-cover rounded-md" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => removeImage(url, 'galleryImageUrls')}><X className="h-3 w-3" /></Button>
                            </div>
                        ))}
                         <div>
                            <label htmlFor="gallery-upload" className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50"><Upload className="h-6 w-6 text-muted-foreground" /></label>
                            <Input id="gallery-upload" type="file" multiple className="sr-only" onChange={(e) => handleImageUpload(e, 'galleryImageUrls')} accept="image/*" />
                        </div>
                    </div>
                </div>
                {uploadProgress && Object.entries(uploadProgress).map(([name, progress]) => (
                    <div key={name}>
                        <p className="text-sm text-muted-foreground">{name}</p>
                        <Progress value={progress} />
                    </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

            {isAdmin && (
                <div className="space-y-4">
                     <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Admin Settings</h3>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                            id="approval"
                            checked={formData.status === 'approved'}
                            onCheckedChange={handleApprovalChange}
                        />
                        <Label htmlFor="approval">Approve and Publish Listing</Label>
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
            <Button type="submit" disabled={loading || !!uploadProgress}>
                {loading ? 'Saving...' : (!!uploadProgress ? 'Uploading...' : 'Save Changes')}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
