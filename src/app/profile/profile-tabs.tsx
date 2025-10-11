
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { updateUser, getUserActivities, getCars, getBusinessesByOwner, deleteBusiness, getCategories, getBusinesses } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sendPasswordReset } from '@/lib/firebase/auth';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ProfileImageUploader } from '@/components/profile/profile-image-uploader';
import type { User, Activity, Vehicle, Business } from '@/lib/types';
import { NotificationItem } from '@/components/layout/notification-item';
import { useSearchParams } from 'next/navigation';
import { VehicleCard } from '@/components/cars/vehicle-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingCard } from '@/components/services/listing-card';
import { Separator } from '@/components/ui/separator';
import { BusinessForm } from '@/components/admin/business-form';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

export default function ProfileTabs() {
  const { user, loading, setUser } = useAuth();
  const [name, setName] = useState('');
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [favoriteCars, setFavoriteCars] = useState<Vehicle[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<Business[]>([]);
  const [favoriteBusinessesLoading, setFavoriteBusinessesLoading] = useState(true);
  const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
  const [myBusinessesLoading, setMyBusinessesLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);


  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const isMember = user && ['Member', 'Admin', 'Owner'].includes(user.role);

  useEffect(() => {
    if (user && isMember) {
      setMyBusinessesLoading(true);
      const businessesCol = collection(db, 'businesses');
      const q = query(businessesCol, where('ownerId', '==', user.id));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const businessesFromDb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
        businessesFromDb.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setMyBusinesses(businessesFromDb);
        setMyBusinessesLoading(false);
      }, (error) => {
        console.error("Failed to subscribe to business updates:", error);
        toast({ title: "Error", description: "Could not fetch your business listings in real-time.", variant: "destructive" });
        setMyBusinessesLoading(false);
      });

      return () => unsubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isMember]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      
      const fetchActivities = async () => {
        setActivitiesLoading(true);
        const userActivities = await getUserActivities(user.id, 20);
        setActivities(userActivities);
        setActivitiesLoading(false);
      };
      
      const fetchFavorites = async () => {
        setFavoritesLoading(true);
        if (user.favoriteCars && user.favoriteCars.length > 0) {
            const { vehicles } = await getCars();
            const userFavorites = vehicles.filter(car => user.favoriteCars!.includes(car.id));
            setFavoriteCars(userFavorites);
        } else {
            setFavoriteCars([]);
        }
        setFavoritesLoading(false);
      };

      const fetchFavoriteBusinesses = async () => {
        setFavoriteBusinessesLoading(true);
        if (user.favoriteBusinesses && user.favoriteBusinesses.length > 0) {
            try {
                const businesses = await getBusinesses({ ids: user.favoriteBusinesses });
                setFavoriteBusinesses(businesses);
            } catch (e) {
                console.error(e);
                setFavoriteBusinesses([]);
            }
        } else {
            setFavoriteBusinesses([]);
        }
        setFavoriteBusinessesLoading(false);
      };

      fetchActivities();
      fetchFavorites();
      fetchFavoriteBusinesses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUser(user.id, { name });
      setUser(prev => prev ? { ...prev, name } : null);
      toast({
        title: 'Profile Updated',
        description: 'Your name has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleAvatarUpdate = async (avatarUrl: string) => {
    if (!user) return;
    try {
      await updateUser(user.id, { avatarUrl });
      setUser((prevUser) => (prevUser ? { ...prevUser, avatarUrl } : null));
      toast({
          title: 'Avatar Updated',
          description: 'Your profile picture has been successfully updated.',
      });
    } catch (error) {
        console.error('Failed to update avatar:', error);
        toast({
            title: 'Error',
            description: 'Failed to update your avatar. Please try again.',
            variant: 'destructive',
        });
    }
  };

  const handlePasswordReset = async () => {
    if (!user) return;
    try {
      await sendPasswordReset(user.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox to reset your password.',
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setIsFormOpen(true);
  }
  
  const handleDeleteClick = (business: Business) => {
    setBusinessToDelete(business);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!businessToDelete) return;
    try {
        await deleteBusiness(businessToDelete.id);
        toast({
            title: 'Business Deleted',
            description: `"${businessToDelete.title}" has been permanently deleted.`,
        });
        // The real-time listener will automatically update the UI.
    } catch (error: any) {
        console.error('Failed to delete business:', error);
        toast({
            title: 'Error',
            description: 'Could not delete the business listing.',
            variant: 'destructive',
        });
    } finally {
        setIsDeleteDialogOpen(false);
        setBusinessToDelete(null);
    }
  };
  
  const handleDataChange = () => {
    // No need to call fetchMyBusinesses anymore due to real-time listener
    if (selectedBusiness?.status === 'approved') {
        toast({
            title: 'Listing Resubmitted',
            description: 'Your changes have been submitted for admin review.',
        });
    } else {
         toast({
            title: 'Listing Updated',
            description: 'Your listing has been updated.',
        });
    }
  };

  if (loading) {
    return <div className="container py-12">Loading profile...</div>;
  }

  if (!user) {
    return <div className="container py-12">Please log in to view your profile.</div>;
  }

  const getStatusVariant = (status?: Business['status']) => {
    switch (status) {
        case 'approved': return 'default';
        case 'pending': return 'secondary';
        case 'edit-pending': return 'outline';
        case 'rejected': return 'destructive';
        default: return 'secondary';
    }
  }

  const tabList = [
    { value: 'profile', label: 'Profile Settings' },
    { value: 'fav-cars', label: 'Favorite Cars' },
    { value: 'fav-businesses', label: 'Favorite Businesses' },
    isMember && { value: 'my-businesses', label: 'My Businesses' },
    { value: 'activity', label: 'My Activity' },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <div className="container py-12">
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className={cn('grid w-full max-w-4xl mx-auto', {
                'grid-cols-4': tabList.length === 4,
                'grid-cols-5': tabList.length === 5,
            })}>
            {tabList.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
            </TabsList>
            <TabsContent value="profile">
                <Card className="max-w-4xl mx-auto mt-6">
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <div className="flex flex-col items-center text-center">
                            <ProfileImageUploader user={user} onAvatarChange={handleAvatarUpdate} />
                            <h2 className="text-2xl font-semibold mt-4">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <Badge variant="outline" className="mt-2">{user.role}</Badge>
                        </div>
                        <Separator />
                        <div className="space-y-3 text-sm">
                            <h3 className="font-semibold text-muted-foreground tracking-wider uppercase">Details</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Joined:</span>
                                <span className="font-medium">{user.createdAt ? format(user.createdAt.toDate(), 'PPp') : 'N/A'}</span>
                            </div>
                            {user.lastLogin && (
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Last Login:</span>
                                <span className="font-medium">{format(user.lastLogin.toDate(), 'PPp')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                        <div className="md:col-span-2 space-y-6">
                        <Card>
                                <CardHeader>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>This is how others will see you on the site.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email (cannot be changed)</Label>
                                        <Input
                                        id="email"
                                        value={user.email}
                                        disabled
                                        />
                                    </div>
                                    <Button type="submit">Update Profile</Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Manage your account security settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">Change your password by receiving a reset link via email.</p>
                                    <Button variant="outline" onClick={handlePasswordReset}>Reset Password</Button>
                                </div>
                            </CardContent>
                        </Card>
                        </div>
                </CardContent>
            </Card>
            </TabsContent>
            <TabsContent value="fav-cars">
            <Card className="max-w-4xl mx-auto mt-6">
                <CardHeader>
                <CardTitle>My Favorite Cars</CardTitle>
                <CardDescription>A list of cars you have saved.</CardDescription>
                </CardHeader>
                <CardContent>
                {favoritesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                    </div>
                ) : favoriteCars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteCars.map((car) => (
                        <VehicleCard key={car.id} vehicle={car} />
                    ))}
                    </div>
                ) : (
                    <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                    You have not favorited any cars yet.
                    </div>
                )}
                </CardContent>
            </Card>
            </TabsContent>
            <TabsContent value="fav-businesses">
            <Card className="max-w-4xl mx-auto mt-6">
                <CardHeader>
                    <CardTitle>My Favorite Businesses</CardTitle>
                    <CardDescription>A list of businesses you have saved.</CardDescription>
                </CardHeader>
                <CardContent>
                    {favoriteBusinessesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-60 w-full" />
                            <Skeleton className="h-60 w-full" />
                        </div>
                    ) : favoriteBusinesses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {favoriteBusinesses.map((business) => (
                                <ListingCard key={business.id} listing={business} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                            You have not favorited any businesses yet.
                        </div>
                    )}
                </CardContent>
            </Card>
            </TabsContent>
            {isMember && (
                <TabsContent value="my-businesses">
                    <Card className="max-w-4xl mx-auto mt-6">
                        <CardHeader>
                            <CardTitle>My Businesses</CardTitle>
                            <CardDescription>Manage your business listings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {myBusinessesLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            ) : myBusinesses.length > 0 ? (
                                <div className="space-y-4">
                                    {myBusinesses.map(business => (
                                        <Card key={business.id} className="flex flex-col md:flex-row items-center p-4 gap-4">
                                            <div className="flex-grow">
                                                <h3 className="font-semibold">{business.title}</h3>
                                                <p className="text-sm text-muted-foreground">{business.category}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                     Submitted: {format(business.createdAt.toDate(), 'PPP')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Button variant="outline" size="sm" onClick={() => handleEditBusiness(business)}>Edit</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(business)}>Delete</Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                                    You have not submitted any business listings yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            )}
            <TabsContent value="activity">
                <Card className="max-w-2xl mx-auto mt-6">
                    <CardHeader>
                    <CardTitle>My Activity</CardTitle>
                    <CardDescription>A log of your recent reviews and comments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {activitiesLoading ? (
                        <p>Loading activities...</p>
                    ) : activities.length > 0 ? (
                            <div className="space-y-1">
                            {activities.map((activity) => (
                                <NotificationItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                            You have no recent activity.
                        </div>
                    )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        
        {isMember && (
            <BusinessForm 
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                business={selectedBusiness}
                onDataChange={handleDataChange}
                categories={[]}
            />
        )}
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the business listing for "{businessToDelete?.title}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </div>
  );
}
