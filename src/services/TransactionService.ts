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

export interface Transaction {
    id: string;
    title: string;
    subtitle: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    categoryId?: string;
    groupId?: string;
    author: string;
}

let transactions: Transaction[] = [];
let listeners: (() => void)[] = [];
let firestoreUnsubscribe: Unsubscribe | null = null;
let currentUserId: string | null = null;

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

export const TransactionService = {
    /** Start listening to transactions for a specific user */
    listen(userId: string) {
        if (currentUserId === userId && firestoreUnsubscribe) return;

        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
        }

        currentUserId = userId;
        const q = query(collection(db, 'transactions'), where('author', '==', userId));

        firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
            transactions = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Transaction[];
            // Sort by date descending (newest first)
            transactions.sort((a, b) => b.date.localeCompare(a.date));
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
        transactions = [];
        notifyListeners();
    },

    getAll(): Transaction[] {
        return [...transactions];
    },

    getById(id: string): Transaction | undefined {
        return transactions.find((tx) => tx.id === id);
    },

    async create(data: Omit<Transaction, 'id'>): Promise<Transaction> {
        const docRef = await addDoc(collection(db, 'transactions'), data);
        return { ...data, id: docRef.id };
    },

    async update(id: string, data: Partial<Omit<Transaction, 'id'>>): Promise<void> {
        const docRef = doc(db, 'transactions', id);
        await updateDoc(docRef, data);
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'transactions', id);
        await deleteDoc(docRef);
    },

    subscribe(listener: () => void): () => void {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
};
