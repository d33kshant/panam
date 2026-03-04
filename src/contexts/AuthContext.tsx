import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '../services/AuthService';
import { CategoryService } from '../services/CategoryService';
import { TransactionService } from '../services/TransactionService';
import { GroupService } from '../services/GroupService';
import { NotificationService } from '../services/NotificationService';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = AuthService.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                // Start listening to Firestore data for this user
                CategoryService.listen(firebaseUser.uid);
                TransactionService.listen(firebaseUser.uid);
                GroupService.listen(firebaseUser.uid);
                NotificationService.listen(firebaseUser.uid);
            } else {
                // Stop listening on logout
                CategoryService.stopListening();
                TransactionService.stopListening();
                GroupService.stopListening();
                NotificationService.stopListening();
            }
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
