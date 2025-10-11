
'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyPasswordResetCode as fbVerifyPasswordResetCode,
  confirmPasswordReset as fbConfirmPasswordReset,
  type User as FirebaseUser,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  getAuth,
} from 'firebase/auth';
import { initializeApp, deleteApp, getApp } from 'firebase/app';
import { doc, setDoc, getDoc, Timestamp, updateDoc, getFirestore } from 'firebase/firestore';
import { logActivity } from './firestore';
import type { User } from '../types';
import { app, db, auth } from './firebase';


export const signUp = async (email: string, password: string, username: string): Promise<void> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  await sendEmailVerification(user);

  await setDoc(doc(db, 'users', user.uid), {
    name: username,
    email: user.email,
    avatarUrl: '',
    role: 'User',
    status: 'Active',
    verified: false,
    createdAt: Timestamp.now(),
  });
  
  await logActivity(`User "${username}" signed up and verification email sent.`, 'user', user.uid);
};

export const createUserAsAdmin = async (email: string, password: string, username: string, role: User['role']): Promise<void> => {
  // Create a secondary app instance to create a user without signing them in
  const secondaryApp = initializeApp(getApp().options, `secondary-app-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const user = userCredential.user;

    // No email verification sent for admin-created users, they are trusted.

    await setDoc(doc(db, 'users', user.uid), {
        name: username,
        email: user.email,
        avatarUrl: '',
        role: role,
        status: 'Active',
        verified: true,
        createdAt: Timestamp.now(),
    });
    
    await logActivity(`Admin created user "${username}".`, 'user', user.uid);

  } finally {
    // Clean up the secondary app instance
    await deleteApp(secondaryApp);
  }
};

export const signIn = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.exists() ? userDoc.data() as User : null;
  
  if (userData?.status === 'Suspended') {
    await signOut(auth);
    const error = new Error('Your account has been suspended.');
    error.name = 'AccountSuspended';
    throw error;
  }

  if (!user.emailVerified && !userData?.verified) {
    await signOut(auth);
    const error = new Error('Email not verified. Please check your inbox for the verification link.');
    error.name = 'EmailNotVerified';
    throw error;
  }
  
  // Sync verification status on login
  if (user.emailVerified && userData && !userData.verified) {
    await updateDoc(userDocRef, { verified: true });
  }

  await updateDoc(userDocRef, {
    lastLogin: Timestamp.now(),
  });
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
    // To resend, we need a user object. We can't get it just from email.
    // A common workaround is to sign them in briefly to get the user object.
    // Let's assume the user object is available from the failed sign in.
    if (auth.currentUser && auth.currentUser.email === email && !auth.currentUser.emailVerified) {
         await sendEmailVerification(auth.currentUser);
    } else {
        // This is a fallback and might not always work as intended without a password.
        // A more robust solution might require a separate flow.
        throw new Error('Could not find user to resend verification. Please try logging in again first.');
    }
}


export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const verifyPasswordResetCode = async (oobCode: string): Promise<string> => {
    const email = await fbVerifyPasswordResetCode(auth, oobCode);
    return email;
};

export const confirmPasswordReset = async (oobCode: string, newPassword: string): Promise<void> => {
    await fbConfirmPasswordReset(auth, oobCode, newPassword);
};


export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;

        if (userData.status === 'Suspended') {
            await signOut(auth);
            callback(null);
            return;
        }

        // Sync email verification status from Firebase Auth to Firestore
        if (user.emailVerified && !userData.verified) {
            await updateDoc(userDocRef, { verified: true });
            userData.verified = true; // Update local copy to avoid re-fetch
        }

        if (userData.verified) {
             callback({ id: user.uid, ...userData });
        } else {
            await signOut(auth);
            callback(null);
        }
      } else {
        // This case might happen if the Firestore document creation failed after signup
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

export const getCurrentUser = (): Promise<User | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
            unsubscribe();
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data() as User;
                     if (user.emailVerified || userData.verified) {
                        resolve({ id: user.uid, ...userData });
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
};
