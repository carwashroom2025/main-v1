
import { db } from '../firebase';
import { collection, getDocs, doc, query, orderBy, getCountFromServer, addDoc, updateDoc, deleteDoc, Timestamp, setDoc, writeBatch } from 'firebase/firestore';
import type { Category } from '../../types';
import { getCurrentUser } from '../auth';
import { logActivity } from './activity';
import { PlaceHolderImages } from '../../placeholder-images';

// Categories
export async function getCategories(): Promise<Category[]> {
    const categoriesCol = collection(db, 'categories');
    const q = query(categoriesCol, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function addCategory(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Moderator', 'Administrator'].includes(currentUser.role)) {
        throw new Error('You do not have permission to add categories.');
    }
    const categoriesCol = collection(db, 'categories');
    const docRef = await addDoc(categoriesCol, {
        ...categoryData,
        createdAt: Timestamp.now(),
    });
    await logActivity(`Moderator "${currentUser.name}" added a new category: "${categoryData.name}".`, 'category', docRef.id, currentUser.id);
    return docRef.id;
}

export async function seedInitialCategories(): Promise<{count: number, message: string}> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Moderator', 'Administrator'].includes(currentUser.role)) {
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
    await logActivity(`Moderator "${currentUser.name}" seeded ${count} initial categories.`, 'data', undefined, currentUser.id);

    return { count, message: `Successfully seeded ${count} categories.` };
}

export async function updateCategory(id: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Moderator', 'Administrator'].includes(currentUser.role)) {
        throw new Error('You do not have permission to update categories.');
    }
    const categoryDocRef = doc(db, 'categories', id);
    await updateDoc(categoryDocRef, categoryData);
    await logActivity(`Moderator "${currentUser.name}" updated a category: "${categoryData.name}".`, 'category', id, currentUser.id);
}

export async function deleteCategory(id: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['Moderator', 'Administrator'].includes(currentUser.role)) {
        throw new Error('You do not have permission to delete categories.');
    }
    const categoryDocRef = doc(db, 'categories', id);
    await deleteDoc(categoryDocRef);
    await logActivity(`Moderator "${currentUser.name}" deleted a category.`, 'category', id, currentUser.id);
}
