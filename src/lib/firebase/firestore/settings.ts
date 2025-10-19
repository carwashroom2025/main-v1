
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { SecuritySettings, SeoSettings } from '../../types';

// Settings

// GET
export async function getSettings(id: 'security' | 'seo'): Promise<any> {
    const docRef = doc(db, 'settings', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

// UPDATE
export async function updateSettings(id: 'security' | 'seo', data: SecuritySettings | SeoSettings): Promise<void> {
    const docRef = doc(db, 'settings', id);
    await setDoc(docRef, data, { merge: true });
}
