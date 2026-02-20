import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
    author: string;
    amount: number;
}

// Available category icons mapped by key
import foodIcon from '../components/icons/categories/food.svg';
import transportIcon from '../components/icons/categories/transport.svg';
import shoppingIcon from '../components/icons/categories/shopping.svg';
import groceryIcon from '../components/icons/categories/grocery.svg';
import billsIcon from '../components/icons/categories/bills.svg';
import miscIcon from '../components/icons/categories/misc.svg';

export const categoryIcons: Record<string, string> = {
    food: foodIcon,
    transport: transportIcon,
    shopping: shoppingIcon,
    grocery: groceryIcon,
    bills: billsIcon,
    misc: miscIcon,
};

export const DEFAULT_CATEGORY_ID = '';

let categories: Category[] = [];
let listeners: (() => void)[] = [];
let firestoreUnsubscribe: Unsubscribe | null = null;
let currentUserId: string | null = null;

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

export const CategoryService = {
    /** Start listening to categories for a specific user */
    listen(userId: string) {
        // Avoid re-subscribing to the same user
        if (currentUserId === userId && firestoreUnsubscribe) return;

        // Cleanup previous listener
        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
        }

        currentUserId = userId;
        const q = query(collection(db, 'categories'), where('author', '==', userId));

        firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
            categories = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Category[];
            notifyListeners();
        });
    },

    /** Stop listening (call on logout) */
    stopListening() {
        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
            firestoreUnsubscribe = null;
        }
        currentUserId = null;
        categories = [];
        notifyListeners();
    },

    getAll(): Category[] {
        return [...categories];
    },

    getById(id: string): Category | undefined {
        return categories.find((cat) => cat.id === id);
    },

    async create(data: Omit<Category, 'id'>): Promise<Category> {
        const docRef = await addDoc(collection(db, 'categories'), data);
        return { ...data, id: docRef.id };
    },

    async update(id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
        const docRef = doc(db, 'categories', id);
        await updateDoc(docRef, data);
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'categories', id);
        await deleteDoc(docRef);
    },

    subscribe(listener: () => void): () => void {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
};
