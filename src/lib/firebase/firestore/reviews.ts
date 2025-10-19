
import { db } from '../firebase';
import { collection, getDocs, doc, query, where, orderBy, addDoc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import type { Review } from '../../types';
import { getCurrentUser } from '../auth';
import { logActivity } from './activity';

// Reviews

// GET
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

// ADD
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

// DELETE
export async function deleteReview(reviewId: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error("You must be logged in to delete reviews.");
    }

    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (reviewSnap.exists()) {
        const reviewData = reviewSnap.data() as Review;

        if (!['Moderator', 'Administrator'].includes(currentUser.role) && currentUser.id !== reviewData.userId) {
            throw new Error("You don't have permission to delete this review.");
        }

        await deleteDoc(reviewRef);
        await logActivity(`User "${currentUser.name}" deleted a review for "${reviewData.itemTitle}".`, 'review', reviewData.itemId, currentUser.id);
    }
}
