
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, Timestamp, startAt, endAt, documentId, startAfter, writeBatch, runTransaction, increment, arrayUnion, setDoc, arrayRemove, serverTimestamp } from 'firebase/firestore';
import type { Vehicle, Review } from '../../types';
import { getCurrentUser } from '../auth';
import { logActivity } from './activity';
import { getAllReviews } from './reviews';

// Cars / Vehicles

// GET
export async function getCars({ page = 1, limit: itemsPerPage = 9, sortBy = 'createdAt-desc', brandFilter = 'all', typeFilter = 'all', yearFilter = 'all', searchTerm = '', all = false } = {}): Promise<{ vehicles: Vehicle[], totalCount: number }> {
    const carsCol = collection(db, 'cars');
    let q = query(carsCol);

    const allCarsSnapshot = await getDocs(q);
    let allCars = allCarsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));

    if (all) {
        return { vehicles: allCars, totalCount: allCars.length };
    }

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

    const getTime = (date: any): number => {
        if (!date) return 0;
        if (date instanceof Timestamp) return date.toMillis();
        if (typeof date === 'string') return new Date(date).getTime();
        if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
            return new Timestamp(date.seconds, date.nanoseconds).toMillis();
        }
        return 0;
    };

    allCars.sort((a, b) => {
        const timeA = getTime(a.createdAt);
        const timeB = getTime(b.createdAt);

        if (sortBy === 'createdAt-asc') {
            return timeA - timeB;
        }
        return timeB - timeA;
    });

    const totalCount = allCars.length;
    
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedCars = allCars.slice(startIndex, startIndex + itemsPerPage);

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
            acc[review.itemId].push(review);
        }
        return acc;
    }, {} as Record<string, Review[]>);

    const vehiclesWithRatings = vehicles.map(vehicle => {
        const vehicleReviews = reviewsByItem[vehicle.id] || [];
        const reviewCount = vehicleReviews.length;
        const averageRating = reviewCount > 0 
            ? vehicleReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;
        return { ...vehicle, averageRating, reviewCount };
    });

    return vehiclesWithRatings;
}

// ADD
export async function addVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Moderator', 'Administrator', 'Author'].includes(currentUser.role)) {
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

// UPDATE
export async function updateVehicle(id: string, vehicleData: Partial<Omit<Vehicle, 'id'>>): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Moderator', 'Administrator'].includes(currentUser.role)) {
        throw new Error('You do not have permission to update vehicles.');
    }
    const vehicleDocRef = doc(db, 'cars', id);
    await updateDoc(vehicleDocRef, vehicleData);
}

// DELETE
export async function deleteVehicle(id: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Moderator', 'Administrator'].includes(currentUser.role)) {
        throw new Error('You do not have permission to delete vehicles.');
    }
    const vehicleDocRef = doc(db, 'cars', id);
    await deleteDoc(vehicleDocRef);
}

export async function deleteMultipleVehicles(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    
    const batch = writeBatch(db);
    ids.forEach(id => {
        const docRef = doc(db, 'cars', id);
        batch.delete(docRef);
    });

    await batch.commit();
}
