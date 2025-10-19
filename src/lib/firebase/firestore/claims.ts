
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, updateDoc, Timestamp, runTransaction } from 'firebase/firestore';
import type { Business, BusinessClaim } from '../../types';

// Business Claims

// GET
export async function getPendingClaimForBusiness(businessId: string, userId: string): Promise<BusinessClaim | null> {
    const claimsCol = collection(db, 'claims');
    const q = query(claimsCol, 
        where('businessId', '==', businessId), 
        where('userId', '==', userId),
        where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BusinessClaim;
}
  
export async function getPendingClaims(): Promise<BusinessClaim[]> {
    const claimsCol = collection(db, 'claims');
    const q = query(claimsCol, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessClaim));
}

// ADD
export async function submitBusinessClaim(claimData: Omit<BusinessClaim, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const claimsCol = collection(db, 'claims');
    const docRef = await addDoc(claimsCol, {
      ...claimData,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    return docRef.id;
}

// UPDATE
export async function approveClaim(claimId: string, adminId: string): Promise<void> {
    const claimRef = doc(db, 'claims', claimId);

    return runTransaction(db, async (transaction) => {
        const claimDoc = await transaction.get(claimRef);
        if (!claimDoc.exists() || claimDoc.data().status !== 'pending') {
            throw new Error("Claim not found or already processed.");
        }

        const claimData = claimDoc.data() as BusinessClaim;
        const businessRef = doc(db, 'businesses', claimData.businessId);
        const userRef = doc(db, 'users', claimData.userId);

        const businessDoc = await transaction.get(businessRef);
        if (!businessDoc.exists()) {
            throw new Error("Business to be claimed does not exist.");
        }
        
        const userDoc = await transaction.get(userRef);
        if (userDoc.exists() && userDoc.data().role === 'User') {
            transaction.update(userRef, { role: 'Business Owner' });
        }

        transaction.update(claimRef, { 
            status: 'approved',
            reviewedAt: Timestamp.now(),
            reviewedBy: adminId,
        });

        transaction.update(businessRef, {
            ownerId: claimData.userId,
            ownerName: claimData.userName,
            verified: true,
        });
    });
}

export async function rejectClaim(claimId: string, adminId: string): Promise<void> {
    const claimRef = doc(db, 'claims', claimId);
    await updateDoc(claimRef, {
        status: 'rejected',
        reviewedAt: Timestamp.now(),
        reviewedBy: adminId,
    });
}
