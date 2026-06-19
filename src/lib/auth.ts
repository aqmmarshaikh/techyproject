import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Helper to create user profile in Firestore
export const createUserProfile = async (uid: string, name: string, email: string, photoURL?: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    uid,
    name,
    email,
    photoURL: photoURL || '',
    role: 'creator', // Default role is creator
    createdAt: serverTimestamp(),
    totalProjects: 0,
    totalViews: 0,
    totalLikes: 0
  }, { merge: true });
};

// Helper for Google sign-in to check/create user profile
export const checkAndCreateGoogleUserProfile = async (user: User): Promise<void> => {
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || 'Google User',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: 'creator',
      createdAt: serverTimestamp(),
      totalProjects: 0,
      totalViews: 0,
      totalLikes: 0
    });
  }
};

export const registerWithEmail = async (email: string, password: string, name: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create their profile in Firestore
    await createUserProfile(userCredential.user.uid, name, email);
    return userCredential.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await checkAndCreateGoogleUserProfile(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Maintain adminLogin alias to avoid breaking existing code
export const adminLogin = loginWithEmail;

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Maintain adminLogout alias to avoid breaking existing code
export const adminLogout = logout;

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
