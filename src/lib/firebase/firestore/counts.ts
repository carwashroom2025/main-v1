
import { db } from '../firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

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
