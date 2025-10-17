

import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, getCountFromServer, addDoc, updateDoc, deleteDoc, Timestamp, startAt, endAt, documentId, startAfter, writeBatch, runTransaction, increment, arrayUnion, setDoc, arrayRemove, serverTimestamp } from 'firebase/firestore';
import type { BlogPost, Business, Vehicle, User, Activity, Question, Answer, Settings, SecuritySettings, SeoSettings, Comment, Reply, Review, Category } from '../types';
import { deleteFile } from './storage';
import { getCurrentUser } from './auth';
import { v4 as uuidv4 } from 'uuid';
import { PlaceHolderImages } from '../placeholder-images';

// Settings
export async function getSettings(id: 'security' | 'seo'): Promise<any> {
    const docRef = doc(db, 'settings', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

export async function updateSettings(id: 'security' | 'seo', data: SecuritySettings | SeoSettings): Promise<void> {
    const docRef = doc(db, 'settings', id);
    await setDoc(docRef, data, { merge: true });
}


// Activity Logging
export async function logActivity(
    description: string, 
    type: Activity['type'], 
    relatedId?: string, 
    userId?: string
): Promise<void> {
    const activitiesCol = collection(db, 'activities');
    await addDoc(activitiesCol, {
        description,
        type,
        timestamp: Timestamp.now(),
        relatedId: relatedId || null,
        userId: userId || null,
        read: false,
    });
}

export async function clearAllActivities(): Promise<void> {
    const activitiesCol = collection(db, 'activities');
    const snapshot = await getDocs(activitiesCol);

    if (snapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    const currentUser = await getCurrentUser();
    if (currentUser) {
        await logActivity(`Admin "${currentUser.name}" cleared the activity log.`, 'data', undefined, currentUser.id);
    }
}

export async function clearUserActivities(userId: string): Promise<void> {
    const activitiesCol = collection(db, 'activities');
    const q = query(activitiesCol, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
}


export async function getActivities(
    page: number = 1,
    itemsPerPage: number = 10,
    filters: { type?: string, searchTerm?: string } = {}
): Promise<{ activities: Activity[], totalCount: number }> {
    const activitiesCol = collection(db, 'activities');
    let q = query(activitiesCol);
    
    // Apply filters
    if (filters.type && filters.type !== 'all') {
        q = query(q, where('type', '==', filters.type));
    }
    
    // Firestore does not support text search on partial strings directly.
    // A more robust solution would use a search service like Algolia or Meilisearch.
    // For this implementation, we will fetch and filter in memory if a search term is provided.
    // This is inefficient but works for small datasets.
    
    const allDocsSnapshot = await getDocs(q);
    let activitiesList = allDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));

    if (filters.searchTerm) {
        activitiesList = activitiesList.filter(activity => 
            activity.description.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
    }
    
    // Sort after potential in-memory search
    activitiesList.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

    const totalCount = activitiesList.length;
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedActivities = activitiesList.slice(startIndex, startIndex + itemsPerPage);

    return { activities: paginatedActivities, totalCount };
}


export async function getRecentActivities(count: number): Promise<Activity[]> {
    const activitiesCol = collection(db, 'activities');
    const q = query(activitiesCol, orderBy('timestamp', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
}

export async function getUserActivities(userId: string, count: number = 10): Promise<Activity[]> {
    const activitiesCol = collection(db, 'activities');
    const q = query(
        activitiesCol, 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'), 
        limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
}

export async function updateActivityReadStatus(activityIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    activityIds.forEach(id => {
        const activityRef = doc(db, 'activities', id);
        batch.update(activityRef, { read: true });
    });
    try {
      await batch.commit();
    } catch (error) {
      console.warn("Could not mark all activities as read, some may have been deleted.", error);
    }
}


// Count Functions
export async function getUsersCount(): Promise<number> {
    const usersCol = collection(db, 'users');
    const snapshot = await getCountFromServer(usersCol);
    return snapshot.data().count;
}

export async function getBusinessesCount(): Promise<number> {
    const businessesCol = collection(db, 'businesses');
    const q = query(businessesCol, where('verified', '==', true));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
}

export async function getCarsCount(): Promise<number> {
    const carsCol = collection(db, 'cars');
    const snapshot = await getCountFromServer(carsCol);
    return snapshot.data().count;
}

export async function getBlogPostsCount(): Promise<number> {
    const postsCol = collection(db, 'blogPosts');
    const snapshot = await getCountFromServer(postsCol);
    return snapshot.data().count;
}

export async function getPendingListingsCount(): Promise<number> {
    const businessesCol = collection(db, 'businesses');
    const q = query(businessesCol, where('status', 'in', ['pending', 'edit-pending']));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
}

export async function getReviewsCount(): Promise<number> {
    const reviewsCol = collection(db, 'reviews');
    const snapshot = await getCountFromServer(reviewsCol);
    return snapshot.data().count;
}


// Users
export async function getUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('createdAt', 'desc'));
    const usersSnapshot = await getDocs(q);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return usersList;
}

export async function updateUser(id: string, userData: Partial<Omit<User, 'id'>>): Promise<void> {
    const userDocRef = doc(db, 'users', id);
    await updateDoc(userDocRef, userData);
}

export async function deleteUser(id: string): Promise<void> {
    const userDocRef = doc(db, 'users', id);
    await deleteDoc(userDocRef);
}


export async function toggleFavorite(userId: string, carId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
  
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
  
    const userData = userDoc.data();
    const favoriteCars = userData.favoriteCars || [];
  
    if (favoriteCars.includes(carId)) {
      // Remove from favorites
      await updateDoc(userRef, {
        favoriteCars: arrayRemove(carId)
      });
    } else {
      // Add to favorites
      await updateDoc(userRef, {
        favoriteCars: arrayUnion(carId)
      });
    }
}

export async function toggleFavoriteBusiness(userId: string, businessId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        throw new Error("User not found");
    }

    const userData = userDoc.data();
    const favoriteBusinesses = userData.favoriteBusinesses || [];

    if (favoriteBusinesses.includes(businessId)) {
        await updateDoc(userRef, {
            favoriteBusinesses: arrayRemove(businessId)
        });
    } else {
        await updateDoc(userRef, {
            favoriteBusinesses: arrayUnion(businessId)
        });
    }
}


// Blog Posts
export async function getBlogPosts({ category, tag }: { category?: string | null, tag?: string | null } = {}): Promise<BlogPost[]> {
    const postsCol = collection(db, 'blogPosts');
    const q = query(postsCol, orderBy('date', 'desc'));

    const postsSnapshot = await getDocs(q);
    let postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

    if (category) {
        postsList = postsList.filter(post => post.category === category);
    }
    if (tag) {
        postsList = postsList.filter(post => post.tags.includes(tag));
    }

    return postsList;
}

export async function getRelatedBlogPosts(currentPost: BlogPost, count: number): Promise<BlogPost[]> {
    if (!currentPost) return [];

    const postsCol = collection(db, 'blogPosts');
    const allPostsSnapshot = await getDocs(postsCol);
    const allPosts = allPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
        .filter(p => p.id !== currentPost.id); // Exclude the current post

    const relatedScores: { [postId: string]: number } = {};

    allPosts.forEach(post => {
        let score = 0;
        if (post.author === currentPost.author) {
            score += 3;
        }
        if (post.category === currentPost.category) {
            score += 2;
        }
        
        const commonTags = post.tags?.filter(tag => currentPost.tags?.includes(tag)) || [];
        score += commonTags.length;

        if (score > 0) {
            relatedScores[post.id] = score;
        }
    });

    const sortedRelatedPostIds = Object.keys(relatedScores).sort((a, b) => relatedScores[b] - relatedScores[a]);
    
    const relatedPosts = sortedRelatedPostIds
        .map(id => allPosts.find(p => p.id === id))
        .filter((p): p is BlogPost => !!p)
        .slice(0, count);

    return relatedPosts;
}

export async function getRecentBlogPosts(count: number): Promise<BlogPost[]> {
    const postsCol = collection(db, 'blogPosts');
    const q = query(postsCol, orderBy('date', 'desc'), limit(count));
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    return postsList;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    const postsCol = collection(db, 'blogPosts');
    const q = query(postsCol, where('slug', '==', slug));
    const postSnapshot = await getDocs(q);
    if (postSnapshot.empty) {
        return null;
    }
    const postDoc = postSnapshot.docs[0];
    return { id: postDoc.id, ...postDoc.data() } as BlogPost;
}

export async function addBlogPost(postData: Omit<BlogPost, 'id'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Author', 'Admin', 'Owner'].includes(currentUser.role)) {
        throw new Error('You do not have permission to add blog posts.');
    }
    const postsCol = collection(db, 'blogPosts');
    const docRef = await addDoc(postsCol, {
        ...postData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    await logActivity(`User "${currentUser.name}" created a new blog post: "${postData.title}".`, 'blog', docRef.id, currentUser.id);
    return docRef.id;
}

export async function updateBlogPost(id: string, postData: Partial<BlogPost>): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('You must be logged in to update a post.');
    
    const postDocRef = doc(db, 'blogPosts', id);
    const postDoc = await getDoc(postDocRef);
    if (!postDoc.exists()) throw new Error('Post not found.');

    const originalPost = postDoc.data() as BlogPost;

    const isAdmin = ['Admin', 'Owner'].includes(currentUser.role);
    const isAuthor = currentUser.id === originalPost.authorId;

    if (!isAdmin && !isAuthor) {
        throw new Error('You do not have permission to update this post.');
    }

    await updateDoc(postDocRef, {
        ...postData,
        updatedAt: Timestamp.now(),
    });
    await logActivity(`User "${currentUser.name}" updated the blog post: "${postData.title}".`, 'blog', id, currentUser.id);
}

export async function deleteBlogPost(id: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('You must be logged in to delete a post.');

    const postDocRef = doc(db, 'blogPosts', id);
    const postDoc = await getDoc(postDocRef);
    if (!postDoc.exists()) throw new Error('Post not found.');
    
    const originalPost = postDoc.data() as BlogPost;

    const isAdmin = ['Admin', 'Owner'].includes(currentUser.role);
    const isAuthor = currentUser.id === originalPost.authorId;

    if (!isAdmin && !isAuthor) {
        throw new Error('You do not have permission to delete this post.');
    }
    
    await deleteDoc(postDocRef);
    // Note: This does not delete associated images from storage.
    await logActivity(`User "${currentUser.name}" deleted a blog post.`, 'blog', id, currentUser.id);
}

export async function getPopularTags(count: number): Promise<string[]> {
    const posts = await getBlogPosts();
    const tagCounts: { [key: string]: number } = {};

    posts.forEach(post => {
        post.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    const sortedTags = Object.entries(tagCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([tag]) => tag);

    return sortedTags.slice(0, count);
}


// Businesses
export async function getBusinesses(options: { ids?: string[] } = {}): Promise<Business[]> {
    const businessesCol = collection(db, 'businesses');
    let q;
    if (options.ids && options.ids.length > 0) {
        q = query(businessesCol, where(documentId(), 'in', options.ids));
    } else {
        q = query(businessesCol, where('verified', '==', true));
    }
    const businessesSnapshot = await getDocs(q);
    let businessesList = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
    // Sort in memory to avoid needing a composite index
    businessesList = businessesList.sort((a, b) => (b.createdAt as Timestamp).toMillis() - (a.createdAt as Timestamp).toMillis());
    return businessesList;
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

    // Apply filters
    if (options?.categoryFilter && options.categoryFilter !== 'all') {
        q = query(q, where('category', '==', options.categoryFilter));
    }
    if (options?.countryFilter && options.countryFilter !== 'all') {
        q = query(q, where('country', '==', options.countryFilter));
    }
    // Search term filtering will be done in-memory after fetching because Firestore doesn't support partial text search well.

    const totalSnapshot = await getDocs(q);
    let allMatchingDocs = totalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));

    if (options?.searchTerm) {
        allMatchingDocs = allMatchingDocs.filter(business =>
            business.title.toLowerCase().includes(options.searchTerm!.toLowerCase())
        );
    }
    
    // Apply sorting
    if (options?.sortBy === 'createdAt-asc') {
        allMatchingDocs.sort((a, b) => ((a.createdAt as Timestamp)?.toMillis() || 0) - ((b.createdAt as Timestamp)?.toMillis() || 0));
    } else {
        allMatchingDocs.sort((a, b) => ((b.createdAt as Timestamp)?.toMillis() || 0) - ((a.createdAt as Timestamp)?.toMillis() || 0));
    }

    const totalCount = allMatchingDocs.length;

    // Apply pagination
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
    // Sort in-memory to avoid needing a composite index
    return businessesList.sort((a, b) => ((b.createdAt as Timestamp)?.toMillis() || 0) - ((a.createdAt as Timestamp)?.toMillis() || 0));
}

export async function getFeaturedBusinesses(count?: number): Promise<Business[]> {
    const businessesCol = collection(db, 'businesses');
    let q = query(businessesCol, where('featured', '==', true), where('verified', '==', true));

    const businessesSnapshot = await getDocs(q);
    let businessesList = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
    
    // Sort in-memory and apply limit
    businessesList.sort((a, b) => ((b.createdAt as Timestamp)?.toMillis() || 0) - ((a.createdAt as Timestamp)?.toMillis() || 0));

    if (count) {
        return businessesList.slice(0, count);
    }
    
    return businessesList;
}

export async function getBusinessesByOwner(ownerId: string): Promise<Business[]> {
    const businessesCol = collection(db, 'businesses');
    const q = query(businessesCol, where('ownerId', '==', ownerId));
    const businessesSnapshot = await getDocs(q);
    const businesses = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
    // Sort in memory to avoid composite index
    return businesses.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export async function getBusiness(id: string): Promise<Business | null> {
    const businessDocRef = doc(db, 'businesses', id);
    const businessDoc = await getDoc(businessDocRef);
    if (businessDoc.exists()) {
        return { id: businessDoc.id, ...businessDoc.data() } as Business;
    }
    return null;
}

export async function addBusiness(businessData: Omit<Business, 'id'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('You must be logged in to add a business.');
    }
     if (!['Member', 'Admin', 'Owner', 'Author'].includes(currentUser.role)) {
        throw new Error('Only members, authors, or admins can add businesses.');
    }

    const isAdmin = ['Admin', 'Owner', 'Author'].includes(currentUser.role);
    const businessesCol = collection(db, 'businesses');
    
    const newBusinessData = {
      ...businessData,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      status: isAdmin ? 'approved' : 'pending',
      verified: isAdmin,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(businessesCol, newBusinessData);
    
    await logActivity(`User "${currentUser.name}" submitted a new business listing for "${businessData.title}".`, 'listing', docRef.id, currentUser.id);

    return docRef.id;
}
  
export async function updateBusiness(id: string, businessData: Partial<Omit<Business, 'id'>>): Promise<void> {
    const businessDocRef = doc(db, 'businesses', id);
    const dataToUpdate = { ...businessData };
    
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");

    const originalDoc = await getDoc(businessDocRef);
    const originalData = originalDoc.data() as Business;

    // Member is editing their approved listing
    if (currentUser.id === originalData.ownerId && originalData.status === 'approved' && !['Admin', 'Owner'].includes(currentUser.role)) {
        dataToUpdate.status = 'edit-pending';
        dataToUpdate.verified = false;
    }

    if (dataToUpdate.mainImageUrl === undefined) {
        dataToUpdate.mainImageUrl = '';
    }
    if (dataToUpdate.galleryImageUrls === undefined) {
        dataToUpdate.galleryImageUrls = [];
    }

    await updateDoc(businessDocRef, dataToUpdate);
}

export async function deleteBusiness(id: string): Promise<void> {
    const businessToDelete = await getBusiness(id);
    if (!businessToDelete) {
        throw new Error("Business not found");
    }

    const businessDocRef = doc(db, 'businesses', id);
    await deleteDoc(businessDocRef);
}


// Cars / Vehicles
export async function getCars({ page = 1, limit = 9, sortBy = 'createdAt-desc', brandFilter = 'all', typeFilter = 'all', yearFilter = 'all', searchTerm = '', all = false } = {}): Promise<{ vehicles: Vehicle[], totalCount: number }> {
    const carsCol = collection(db, 'cars');
    let q = query(carsCol);

    // This is not efficient for large datasets. In a real-world scenario,
    // you would use a dedicated search service like Algolia or Meilisearch.
    const allCarsSnapshot = await getDocs(q);
    let allCars = allCarsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));

    if (all) {
        return { vehicles: allCars, totalCount: allCars.length };
    }

    // Client-side filtering
    if (brandFilter !== 'all') {
        allCars = allCars.filter(car => car.make === brandFilter);
    }
    if (typeFilter !== 'all') {
        allCars = allCars.filter(car => car.bodyType === typeFilter);
    }
    if (yearFilter !== 'all') {
        allCars = allCars.filter(car => car.year.toString() === yearFilter);
    }
    if (searchTerm) {
        allCars = allCars.filter(car => car.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Client-side sorting
    allCars.sort((a, b) => {
        const timeA = a.createdAt ? (a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) : 0;
        const timeB = b.createdAt ? (b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) : 0;

        if (sortBy === 'createdAt-asc') {
            return timeA - timeB;
        }
        return timeB - timeA;
    });

    const totalCount = allCars.length;
    
    // Client-side pagination
    const startIndex = (page - 1) * limit;
    const paginatedCars = allCars.slice(startIndex, startIndex + limit);

    return { vehicles: paginatedCars, totalCount };
}


export async function getRecentCars(count: number): Promise<Vehicle[]> {
    const { vehicles } = await getCars({ limit: count, sortBy: 'createdAt-desc' });
    const allReviews = await getAllReviews();

    const reviewsByItem = allReviews.reduce((acc, review) => {
        if (review.itemType === 'vehicle') {
            if (!acc[review.itemId]) {
                acc[review.itemId] = [];
            }
            acc[review.itemId].push(review.rating);
        }
        return acc;
    }, {} as Record<string, number[]>);

    const vehiclesWithRatings = vehicles.map(vehicle => {
        const ratings = reviewsByItem[vehicle.id];
        if (ratings && ratings.length > 0) {
            const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
            return { ...vehicle, averageRating };
        }
        return { ...vehicle, averageRating: 0 };
    });

    return vehiclesWithRatings;
}

export async function addVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Admin', 'Owner', 'Author'].includes(currentUser.role)) {
        throw new Error('You do not have permission to add vehicles.');
    }
    
    const vehiclesCol = collection(db, 'cars');
    const docRef = await addDoc(vehiclesCol, {
        ...vehicleData,
        createdAt: Timestamp.now(),
    });
    
    await logActivity(`User "${currentUser.name}" added a new vehicle: "${vehicleData.name}".`, 'data', docRef.id, currentUser.id);
    return docRef.id;
}

export async function updateVehicle(id: string, vehicleData: Partial<Omit<Vehicle, 'id'>>): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Admin', 'Owner'].includes(currentUser.role)) {
        throw new Error('You do not have permission to update vehicles.');
    }
    const vehicleDocRef = doc(db, 'cars', id);
    await updateDoc(vehicleDocRef, vehicleData);
}

export async function deleteVehicle(id: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Admin', 'Owner'].includes(currentUser.role)) {
        throw new Error('You do not have permission to delete vehicles.');
    }
    const vehicleDocRef = doc(db, 'cars', id);
    await deleteDoc(vehicleDocRef);
    // You might want to delete associated images from storage as well
}


// Questions (FAQ)
export async function getQuestions(): Promise<Question[]> {
    const questionsCol = collection(db, 'questions');
    const q = query(questionsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
}

export async function getQuestion(id: string): Promise<Question | null> {
    const questionDocRef = doc(db, 'questions', id);
    
    try {
        const questionDoc = await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(questionDocRef);
            if (!sfDoc.exists()) {
                return null;
            }
            // Increment views
            transaction.update(questionDocRef, { views: increment(1) });
            return sfDoc;
        });

        if (questionDoc) {
             return { id: questionDoc.id, ...questionDoc.data() } as Question;
        }
        return null;

    } catch (e) {
        console.error("Transaction failed: ", e);
        // Fallback to just getting the document if transaction fails
        return getQuestionWithoutIncrementingViews(id);
    }
}

export async function getQuestionWithoutIncrementingViews(id: string): Promise<Question | null> {
    const questionDocRef = doc(db, 'questions', id);
    const questionDoc = await getDoc(questionDocRef);
    if (questionDoc.exists()) {
        return { id: questionDoc.id, ...questionDoc.data() } as Question;
    }
    return null;
}

export async function addQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'views' | 'votes' | 'answers' | 'author' | 'upvotedBy' | 'downvotedBy'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('You must be logged in to ask a question.');
    }
    
    const questionsCol = collection(db, 'questions');
    const docRef = await addDoc(questionsCol, {
        ...questionData,
        author: currentUser.name,
        authorId: currentUser.id,
        createdAt: Timestamp.now(),
        views: 0,
        votes: 0,
        answers: [],
        upvotedBy: [],
        downvotedBy: [],
    });

    await logActivity(`User "${currentUser.name}" asked a new question: "${questionData.title}".`, 'question', docRef.id, currentUser.id);

    return docRef.id;
}


export async function updateQuestion(id: string, questionData: Partial<Omit<Question, 'id'>>): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Admin', 'Owner'].includes(currentUser.role)) {
        throw new Error('You do not have permission to update questions.');
    }
    const questionDocRef = doc(db, 'questions', id);
    await updateDoc(questionDocRef, {
        ...questionData,
    });
    await logActivity(`Admin "${currentUser.name}" updated the question: "${questionData.title}".`, 'question', id, currentUser.id);
}

export async function deleteQuestion(id: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Admin', 'Owner'].includes(currentUser.role)) {
        throw new Error('You do not have permission to delete questions.');
    }
    const questionDocRef = doc(db, 'questions', id);
    await deleteDoc(questionDocRef);
    await logActivity(`Admin "${currentUser.name}" deleted a question.`, 'question', id, currentUser.id);
}

export async function addAnswer(questionId: string, body: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to post an answer.');
    }
  
    const questionRef = doc(db, 'questions', questionId);
  
    const newAnswer: Omit<Answer, 'createdAt'> & { createdAt: Timestamp } = {
      id: uuidv4(),
      body: body,
      author: currentUser.name,
      authorId: currentUser.id,
      authorAvatarUrl: currentUser.avatarUrl || '',
      createdAt: Timestamp.now(),
      votes: 0,
      accepted: false,
      upvotedBy: [],
      downvotedBy: [],
    };
  
    await updateDoc(questionRef, {
      answers: arrayUnion(newAnswer),
    });
}

export async function toggleAnswerAccepted(questionId: string, answerId: string): Promise<void> {
    const currentUser = await getCurrentUser();
    const questionRef = doc(db, 'questions', questionId);
  
    await runTransaction(db, async (transaction) => {
      const questionDoc = await transaction.get(questionRef);
      if (!questionDoc.exists()) {
        throw new Error('Question does not exist!');
      }
  
      const questionData = questionDoc.data() as Question;
  
      if (currentUser?.id !== questionData.authorId) {
        throw new Error('Only the author of the question can accept an answer.');
      }
  
      let isAlreadyAccepted = false;
      const newAnswers = questionData.answers.map((answer) => {
        if (answer.id === answerId) {
          if (answer.accepted) {
            isAlreadyAccepted = true;
            return { ...answer, accepted: false }; // Un-accept if already accepted
          } else {
            return { ...answer, accepted: true }; // Accept it
          }
        }
        return { ...answer, accepted: false }; // Un-accept all others
      });
  
      // If we are un-accepting, just update with the new array
      if (isAlreadyAccepted) {
        transaction.update(questionRef, { answers: newAnswers });
      } else {
        // If we are accepting, ensure only one is accepted
        const finalAnswers = newAnswers.map(a => a.id === answerId ? a : {...a, accepted: false});
        transaction.update(questionRef, { answers: finalAnswers });
      }
    });
}

export async function voteOnQuestion(questionId: string, userId: string, voteType: 'up' | 'down'): Promise<void> {
    const questionRef = doc(db, 'questions', questionId);

    await runTransaction(db, async (transaction) => {
        const questionDoc = await transaction.get(questionRef);
        if (!questionDoc.exists()) {
            throw new Error("Question not found");
        }
        const questionData = questionDoc.data() as Question;

        const upvotedBy = questionData.upvotedBy || [];
        const downvotedBy = questionData.downvotedBy || [];
        const isUpvoted = upvotedBy.includes(userId);
        const isDownvoted = downvotedBy.includes(userId);

        let newUpvotedBy = [...upvotedBy];
        let newDownvotedBy = [...downvotedBy];

        if (voteType === 'up') {
            if (isUpvoted) {
                newUpvotedBy = newUpvotedBy.filter(id => id !== userId); // Remove upvote
            } else {
                newUpvotedBy.push(userId); // Add upvote
                newDownvotedBy = newDownvotedBy.filter(id => id !== userId); // Remove downvote if exists
            }
        } else { // downvote
            if (isDownvoted) {
                newDownvotedBy = newDownvotedBy.filter(id => id !== userId); // Remove downvote
            } else {
                newDownvotedBy.push(userId); // Add downvote
                newUpvotedBy = newUpvotedBy.filter(id => id !== userId); // Remove upvote if exists
            }
        }
        
        const newVoteCount = newUpvotedBy.length - newDownvotedBy.length;
        
        transaction.update(questionRef, {
            upvotedBy: newUpvotedBy,
            downvotedBy: newDownvotedBy,
            votes: newVoteCount,
        });
    });
}

export async function voteOnAnswer(questionId: string, answerId: string, userId: string, voteType: 'up' | 'down'): Promise<void> {
    const questionRef = doc(db, 'questions', questionId);
    
    await runTransaction(db, async (transaction) => {
        const questionDoc = await transaction.get(questionRef);
        if (!questionDoc.exists()) {
            throw new Error("Question not found");
        }
        const questionData = questionDoc.data() as Question;
        const answers = questionData.answers || [];
        const answerIndex = answers.findIndex(a => a.id === answerId);

        if (answerIndex === -1) {
            throw new Error("Answer not found");
        }
        
        const answer = { ...answers[answerIndex] };
        const upvotedBy = answer.upvotedBy || [];
        const downvotedBy = answer.downvotedBy || [];
        const isUpvoted = upvotedBy.includes(userId);
        const isDownvoted = downvotedBy.includes(userId);

        let newUpvotedBy = [...upvotedBy];
        let newDownvotedBy = [...downvotedBy];

        if (voteType === 'up') {
            if (isUpvoted) {
                newUpvotedBy = newUpvotedBy.filter(id => id !== userId);
            } else {
                newUpvotedBy.push(userId);
                newDownvotedBy = newDownvotedBy.filter(id => id !== userId);
            }
        } else { // downvote
            if (isDownvoted) {
                newDownvotedBy = newDownvotedBy.filter(id => id !== userId);
            } else {
                newDownvotedBy.push(userId);
                newUpvotedBy = newUpvotedBy.filter(id => id !== userId);
            }
        }

        answer.upvotedBy = newUpvotedBy;
        answer.downvotedBy = newDownvotedBy;
        answer.votes = newUpvotedBy.length - newDownvotedBy.length;
        
        const newAnswers = [...answers];
        newAnswers[answerIndex] = answer;

        transaction.update(questionRef, { answers: newAnswers });
    });
}


// Comments
export async function getAllComments(): Promise<Comment[]> {
    const commentsCol = collection(db, 'comments');
    const snapshot = await getDocs(commentsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
}

export async function getComments(postId: string): Promise<Comment[]> {
    const commentsCol = collection(db, 'comments');
    const q = query(commentsCol, where('postId', '==', postId));
    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    
    // Sort manually in the client
    return comments.sort((a, b) => b.date.toMillis() - a.date.toMillis());
}

export async function addComment(postId: string, text: string, parentCommentId?: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error("You must be logged in to comment.");
    }

    if (parentCommentId) {
        // This is a reply
        const reply: Reply = {
            id: uuidv4(),
            author: currentUser.name,
            authorId: currentUser.id,
            authorAvatarUrl: currentUser.avatarUrl,
            date: Timestamp.now(),
            text,
        };
        const commentRef = doc(db, 'comments', parentCommentId);
        const commentSnap = await getDoc(commentRef);
        if (commentSnap.exists()) {
            const commentData = commentSnap.data() as Comment;
            await logActivity(`User "${currentUser.name}" replied to a comment on a blog post.`, 'question', commentData.postId, currentUser.id);
            await updateDoc(commentRef, {
                replies: arrayUnion(reply)
            });
        }

    } else {
        // This is a top-level comment
        const comment: Omit<Comment, 'id'> = {
            postId,
            author: currentUser.name,
            authorId: currentUser.id,
            authorAvatarUrl: currentUser.avatarUrl,
            date: Timestamp.now(),
            text,
            replies: [],
        };
        const commentsCol = collection(db, 'comments');
        const docRef = await addDoc(commentsCol, comment);
        await logActivity(`User "${currentUser.name}" commented on a blog post.`, 'question', postId, currentUser.id);
    }
}

export async function deleteComment(commentId: string): Promise<void> {
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);
}

export async function deleteReply(commentId: string, reply: Reply): Promise<void> {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
        replies: arrayRemove(reply)
    });
}

// Reviews
export async function getReviews(itemId: string): Promise<Review[]> {
    const reviewsCol = collection(db, 'reviews');
    const q = query(reviewsCol, where('itemId', '==', itemId));
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    return reviews.sort((a,b) => (b.createdAt as Timestamp).toMillis() - (a.createdAt as Timestamp).toMillis());
}

export async function getAllReviews(): Promise<Review[]> {
    const reviewsCol = collection(db, 'reviews');
    const q = query(reviewsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
}

export async function addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'userId' | 'author' | 'authorAvatarUrl'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error("You must be logged in to write a review.");
    }
    const reviewsCol = collection(db, 'reviews');
    const docRef = await addDoc(reviewsCol, {
        ...reviewData,
        userId: currentUser.id,
        author: currentUser.name,
        authorAvatarUrl: currentUser.avatarUrl || '',
        createdAt: Timestamp.now(),
    });

    await logActivity(`User "${currentUser.name}" left a ${reviewData.rating}-star review for "${reviewData.itemTitle}".`, 'review', reviewData.itemId, currentUser.id);

    return docRef.id;
}

export async function deleteReview(reviewId: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error("You must be logged in to delete reviews.");
    }

    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (reviewSnap.exists()) {
        const reviewData = reviewSnap.data() as Review;

        // Check permissions: Admin/Owner or the user who wrote the review
        if (!['Admin', 'Owner'].includes(currentUser.role) && currentUser.id !== reviewData.userId) {
            throw new Error("You don't have permission to delete this review.");
        }

        await deleteDoc(reviewRef);
        await logActivity(`User "${currentUser.name}" deleted a review for "${reviewData.itemTitle}".`, 'review', reviewData.itemId, currentUser.id);
    }
}

// Categories
export async function getCategories(): Promise<Category[]> {
    const categoriesCol = collection(db, 'categories');
    const q = query(categoriesCol, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function addCategory(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Admin', 'Owner'].includes(currentUser.role)) {
        throw new Error('You do not have permission to add categories.');
    }
    const categoriesCol = collection(db, 'categories');
    const docRef = await addDoc(categoriesCol, {
        ...categoryData,
        createdAt: Timestamp.now(),
    });
    await logActivity(`Admin "${currentUser.name}" added a new category: "${categoryData.name}".`, 'category', docRef.id, currentUser.id);
    return docRef.id;
}

export async function seedInitialCategories(): Promise<{count: number, message: string}> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Admin', 'Owner'].includes(currentUser.role)) {
        throw new Error('You do not have permission to seed categories.');
    }

    const categoriesCol = collection(db, 'categories');
    const existingSnapshot = await getCountFromServer(categoriesCol);
    if (existingSnapshot.data().count > 0) {
        return { count: 0, message: "Categories collection is not empty. Seeding aborted." };
    }

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

    const initialCategories = [
      { name: "Car Wash & Detailing" },
      { name: "Service Centres" },
      { name: "Dealerships" },
      { name: "Pre Owned Car Dealers" },
      { name: "Showrooms" },
      { name: "Insurance & Protection" },
      { name: "Car Rentals" },
      { name: "Parts & Accessories" },
      { name: "Customs & Modifications" },
      { name: "Other Services" }
    ];

    const batch = writeBatch(db);
    initialCategories.forEach(category => {
        const docRef = doc(collection(db, 'categories'));
        const imageId = categoryImageMap[category.name];
        const image = PlaceHolderImages.find(img => img.id === imageId);
        batch.set(docRef, { 
            ...category,
            imageUrl: image?.imageUrl || '',
            createdAt: Timestamp.now()
        });
    });

    await batch.commit();
    const count = initialCategories.length;
    await logActivity(`Admin "${currentUser.name}" seeded ${count} initial categories.`, 'data', undefined, currentUser.id);

    return { count, message: `Successfully seeded ${count} categories.` };
}

export async function updateCategory(id: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Admin', 'Owner'].includes(currentUser.role)) {
        throw new Error('You do not have permission to update categories.');
    }
    const categoryDocRef = doc(db, 'categories', id);
    await updateDoc(categoryDocRef, categoryData);
    await logActivity(`Admin "${currentUser.name}" updated a category: "${categoryData.name}".`, 'category', id, currentUser.id);
}

export async function deleteCategory(id: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Admin', 'Owner'].includes(currentUser.role)) {
        throw new Error('You do not have permission to delete categories.');
    }
    const categoryDocRef = doc(db, 'categories', id);
    await deleteDoc(categoryDocRef);
    await logActivity(`Admin "${currentUser.name}" deleted a category.`, 'category', id, currentUser.id);
}


// Analytics
export async function getMonthlyUserRegistrations() {
    try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, orderBy('createdAt', 'asc'));
        const usersSnapshot = await getDocs(q);
        
        const monthlyData: { [key: string]: number } = {};

        usersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.createdAt && data.createdAt.toDate) {
                const date = data.createdAt.toDate();
                const month = date.toLocaleString('default', { month: 'long' });
                const year = date.getFullYear();
                const key = `${month} ${year}`;
                
                if (monthlyData[key]) {
                    monthlyData[key]++;
                } else {
                    monthlyData[key] = 1;
                }
            }
        });

        // Get last 6 months of data, including months with 0 users
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const today = new Date();
        const lastSixMonths = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = monthNames[d.getMonth()];
            const year = d.getFullYear();
            const key = `${month} ${year}`;
            lastSixMonths.push({
                month: month.slice(0,3),
                users: monthlyData[key] || 0
            });
        }
        
        return lastSixMonths;
    } catch(e) {
        console.error("Error fetching monthly user registrations:", e);
        return [];
    }
}
