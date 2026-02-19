import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

async function saveUserToFirestore(user: User) {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
        userRef,
        {
            userId: user.uid,
            name: user.displayName || '',
            email: user.email || '',
            avatar: user.photoURL || '',
        },
        { merge: true }
    );
}

export const AuthService = {
    async signInWithGoogle() {
        const result = await signInWithPopup(auth, googleProvider);
        await saveUserToFirestore(result.user);
        return result.user;
    },

    async signOut() {
        await signOut(auth);
    },

    getCurrentUser(): User | null {
        return auth.currentUser;
    },

    onAuthStateChanged(callback: (user: User | null) => void) {
        return auth.onAuthStateChanged(callback);
    },
};
