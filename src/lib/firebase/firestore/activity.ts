
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit, addDoc, Timestamp, writeBatch } from 'firebase/firestore';
import type { Activity } from '../../types';
import { getCurrentUser } from '../auth';

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
        await logActivity(`Moderator "${currentUser.name}" cleared the activity log.`, 'data', undefined, currentUser.id);
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
