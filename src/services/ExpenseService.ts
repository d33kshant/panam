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

export interface ExpenseSplit {
    amount: number;
    settled: boolean;
}

export interface Expense {
    id: string;
    groupId: string;
    note: string;
    totalAmount: number;
    createdBy: string;
    createdAt: string;
    splits: Record<string, ExpenseSplit>;
}

let expenses: Expense[] = [];
let listeners: (() => void)[] = [];
let firestoreUnsubscribe: Unsubscribe | null = null;
let currentGroupId: string | null = null;

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

export const ExpenseService = {
    /** Start listening to expenses for a specific group */
    listen(groupId: string) {
        if (currentGroupId === groupId && firestoreUnsubscribe) return;

        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
        }

        currentGroupId = groupId;
        const q = query(collection(db, 'expenses'), where('groupId', '==', groupId));

        firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
            expenses = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Expense[];
            // Sort by createdAt descending (newest first)
            expenses.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            notifyListeners();
        }, (error) => {
            console.error('ExpenseService onSnapshot error:', error);
        });
    },

    /** Stop listening (call on unmount or group change) */
    stopListening() {
        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
            firestoreUnsubscribe = null;
        }
        currentGroupId = null;
        expenses = [];
        notifyListeners();
    },

    getAll(): Expense[] {
        return [...expenses];
    },

    getById(id: string): Expense | undefined {
        return expenses.find((e) => e.id === id);
    },

    async create(data: Omit<Expense, 'id'>): Promise<Expense> {
        const docRef = await addDoc(collection(db, 'expenses'), data);
        const newExpense = { ...data, id: docRef.id };
        // Optimistic update: add to local cache immediately
        if (!expenses.find((e) => e.id === newExpense.id)) {
            expenses.unshift(newExpense);
            notifyListeners();
        }
        return newExpense;
    },

    /** Settle a specific member's split on an expense */
    async settleMember(expenseId: string, uid: string): Promise<void> {
        const docRef = doc(db, 'expenses', expenseId);
        await updateDoc(docRef, {
            [`splits.${uid}.settled`]: true,
        });
    },

    /** Unsettle a specific member's split on an expense */
    async unsettleMember(expenseId: string, uid: string): Promise<void> {
        const docRef = doc(db, 'expenses', expenseId);
        await updateDoc(docRef, {
            [`splits.${uid}.settled`]: false,
        });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'expenses', id);
        await deleteDoc(docRef);
    },

    subscribe(listener: () => void): () => void {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
};
