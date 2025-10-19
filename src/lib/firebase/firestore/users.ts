
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, orderBy, updateDoc, deleteDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import type { User } from '../../types';

// Users

// GET
export async function getUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('createdAt', 'desc'));
    const usersSnapshot = await getDocs(q);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return usersList;
}

// UPDATE
export async function updateUser(id: string, userData: Partial<Omit<User, 'id'>>): Promise<void> {
    const userDocRef = doc(db, 'users', id);
    await updateDoc(userDocRef, userData);
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
      await updateDoc(userRef, {
        favoriteCars: arrayRemove(carId)
      });
    } else {
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

// DELETE
export async function deleteUser(id: string): Promise<void> {
    const userDocRef = doc(db, 'users', id);
    await deleteDoc(userDocRef);
}
