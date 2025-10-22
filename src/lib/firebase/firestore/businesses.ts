

import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, updateDoc, deleteDoc, Timestamp, documentId, serverTimestamp, addDoc } from 'firebase/firestore';
import type { Business, Review } from '../../types';
import { getCurrentUser } from '../auth';
import { logActivity } from './activity';
import { getAllReviews } from './reviews';

// Businesses

// GET
export async function getBusinesses(options: { ids?: string[] } = {}): Promise<Business[]> {
    const businessesCol = collection(db, 'businesses');
    let q;
    if (options.ids && options.ids.length > 0) {
        q = query(businessesCol, where(documentId(), 'in', options.ids));
    } else {
        q = query(businessesCol, where('status', '==', 'approved'));
    }
    const businessesSnapshot = await getDocs(q);
    const businessesList = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));

    if (businessesList.length === 0) {
        return [];
    }

    const allReviews = await getAllReviews();
    
    const businessesWithRatings = businessesList.map(business => {
        const businessReviews = allReviews.filter(review => review.itemId === business.id && review.itemType === 'business');
        const reviewCount = businessReviews.length;
        const averageRating = reviewCount > 0
            ? businessReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;
        return { ...business, averageRating, reviewCount };
    });

    const getTime = (date: any): number => {
        if (!date) return 0;
        if (date instanceof Timestamp) return date.toMillis();
        if (typeof date === 'string') return new Date(date).getTime();
        if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
            return new Timestamp(date.seconds, date.nanoseconds).toMillis();
        }
        return 0;
    };
    
    return businessesWithRatings.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
}

export async function getAllBusinessesForAdmin(options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    categoryFilter?: string;
    countryFilter?: string;
    searchTerm?: string;
}): Promise<{ businesses: Business[], totalCount: number }> {
    const businessesCol = collection(db, 'businesses');
    let q = query(businessesCol);

    if (options?.categoryFilter && options.categoryFilter !== 'all') {
        q = query(q, where('category', '==', options.categoryFilter));
    }
    if (options?.countryFilter && options.countryFilter !== 'all') {
        q = query(q, where('country', '==', options.countryFilter));
    }

    const totalSnapshot = await getDocs(q);
    let allMatchingDocs = totalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));

    if (options?.searchTerm) {
        allMatchingDocs = allMatchingDocs.filter(business =>
            business.title.toLowerCase().includes(options.searchTerm!.toLowerCase())
        );
    }
    
    const getTime = (date: any): number => {
        if (!date) return 0;
        if (date instanceof Timestamp) return date.toMillis();
        if (typeof date === 'string') return new Date(date).getTime();
        if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
            return new Timestamp(date.seconds, date.nanoseconds).toMillis();
        }
        return 0;
    };

    if (options?.sortBy === 'createdAt-asc') {
        allMatchingDocs.sort((a, b) => getTime(a.createdAt) - getTime(b.createdAt));
    } else {
        allMatchingDocs.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
    }

    const totalCount = allMatchingDocs.length;

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedBusinesses = allMatchingDocs.slice(startIndex, startIndex + limit);

    return { businesses: paginatedBusinesses, totalCount };
}

export async function getPendingBusinesses(): Promise<Business[]> {
    const businessesCol = collection(db, 'businesses');
    const q = query(businessesCol, where('status', 'in', ['pending', 'edit-pending']));
    const businessesSnapshot = await getDocs(q);
    const businessesList = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
    return businessesList.sort((a, b) => ((b.createdAt as Timestamp)?.toMillis() || 0) - ((a.createdAt as Timestamp)?.toMillis() || 0));
}

export async function getFeaturedBusinesses(count?: number): Promise<Business[]> {
    const businessesCol = collection(db, 'businesses');
    let q = query(businessesCol, where('featured', '==', true), where('status', '==', 'approved'));

    const businessesSnapshot = await getDocs(q);
    let businessesList = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));

    const allReviews = await getAllReviews();
    const reviewsByItem = allReviews.reduce((acc, review) => {
        if (review.itemType === 'business') {
            if (!acc[review.itemId]) {
                acc[review.itemId] = [];
            }
            acc[review.itemId].push(review);
        }
        return acc;
    }, {} as Record<string, Review[]>);

    const businessesWithRatings = businessesList.map(business => {
        const businessReviews = reviewsByItem[business.id] || [];
        const reviewCount = businessReviews.length;
        const averageRating = reviewCount > 0 
            ? businessReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;
        return { ...business, averageRating, reviewCount };
    });
    
    const getTime = (date: any): number => {
        if (!date) return 0;
        if (date instanceof Timestamp) return date.toMillis();
        if (typeof date === 'string') return new Date(date).getTime();
        if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
            return new Timestamp(date.seconds, date.nanoseconds).toMillis();
        }
        return 0;
    };
    
    businessesWithRatings.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

    if (count) {
        return businessesWithRatings.slice(0, count);
    }
    
    return businessesWithRatings;
}

export async function getBusinessesByOwner(ownerId: string): Promise<Business[]> {
    const businessesCol = collection(db, 'businesses');
    const q = query(businessesCol, where('ownerId', '==', ownerId));
    const businessesSnapshot = await getDocs(q);
    const businesses = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));

    const getTime = (date: any): number => {
        if (!date) return 0;
        if (date instanceof Timestamp) return date.toMillis();
        if (typeof date === 'string') return new Date(date).getTime();
        if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
            return new Timestamp(date.seconds, date.nanoseconds).toMillis();
        }
        return 0;
    };
    return businesses.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
}

export async function getBusiness(id: string): Promise<Business | null> {
    const businessDocRef = doc(db, 'businesses', id);
    const businessDoc = await getDoc(businessDocRef);
    if (businessDoc.exists()) {
        return { id: businessDoc.id, ...businessDoc.data() } as Business;
    }
    return null;
}

// ADD
export async function addBusiness(businessData: Partial<Omit<Business, 'id'>>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('You must be logged in to add a business.');
    }
    
    const isAdminOrAuthor = ['Moderator', 'Administrator', 'Author'].includes(currentUser.role);
    
    const newBusinessData = {
      ...businessData,
      mainImageUrl: businessData.mainImageUrl || '',
      galleryImageUrls: businessData.galleryImageUrls || [],
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      status: businessData.status || (isAdminOrAuthor ? 'approved' : 'pending'),
      verified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const businessesCol = collection(db, 'businesses');
    const docRef = await addDoc(businessesCol, newBusinessData);
    
    await logActivity(`User "${currentUser.name}" submitted a new business listing for "${businessData.title}".`, 'listing', docRef.id, currentUser.id);

    return docRef.id;
}
  
// UPDATE
export async function updateBusiness(id: string, businessData: Partial<Omit<Business, 'id'>>): Promise<void> {
    const businessDocRef = doc(db, 'businesses', id);
    const dataToUpdate: { [key: string]: any } = { ...businessData };
    
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");

    const originalDoc = await getDoc(businessDocRef);
    const originalData = originalDoc.data() as Business;

    if (currentUser.id === originalData.ownerId && originalData.status === 'approved' && !['Moderator', 'Administrator'].includes(currentUser.role)) {
        dataToUpdate.status = 'edit-pending';
        dataToUpdate.verified = false;
    }

    if (businessData.mainImageUrl !== undefined) {
        dataToUpdate.mainImageUrl = businessData.mainImageUrl;
    }
    if (businessData.galleryImageUrls !== undefined) {
        dataToUpdate.galleryImageUrls = businessData.galleryImageUrls;
    }

    dataToUpdate.updatedAt = serverTimestamp();

    await updateDoc(businessDocRef, dataToUpdate);
}

// DELETE
export async function deleteBusiness(id: string): Promise<void> {
    const businessToDelete = await getBusiness(id);
    if (!businessToDelete) {
        throw new Error("Business not found");
    }

    const businessDocRef = doc(db, 'businesses', id);
    await deleteDoc(businessDocRef);
}
