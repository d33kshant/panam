import {
    collection,
    doc,
    addDoc,
    writeBatch,
    onSnapshot,
    query,
    where,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
    id: string;
    userId: string;
    message: string;
    action: string;
    seen: boolean;
    createdAt: string;
    expiresAt: string;
}

let notifications: Notification[] = [];
let listeners: (() => void)[] = [];
let firestoreUnsubscribe: Unsubscribe | null = null;
let currentUserId: string | null = null;

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

export const NotificationService = {
    /** Start listening to notifications for a specific user */
    listen(userId: string) {
        if (currentUserId === userId && firestoreUnsubscribe) return;

        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
        }

        currentUserId = userId;
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
        );

        firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date().toISOString();
            notifications = snapshot.docs
                .map((d) => ({
                    id: d.id,
                    ...d.data(),
                }))
                .filter((n: any) => n.expiresAt > now) as Notification[];
            // Sort by createdAt descending (newest first)
            notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            notifyListeners();
        }, (error) => {
            console.error('NotificationService onSnapshot error:', error);
        });
    },

    /** Stop listening (call on logout) */
    stopListening() {
        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
            firestoreUnsubscribe = null;
        }
        currentUserId = null;
        notifications = [];
        notifyListeners();
    },

    getAll(): Notification[] {
        return [...notifications];
    },

    getUnseenCount(): number {
        return notifications.filter((n) => !n.seen).length;
    },

    /** Send a notification to a specific user */
    async send(data: Omit<Notification, 'id'>): Promise<void> {
        await addDoc(collection(db, 'notifications'), data);
    },

    /** Send notifications to multiple users at once */
    async sendToMany(userIds: string[], message: string, action: string): Promise<void> {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week

        const batch = writeBatch(db);
        for (const userId of userIds) {
            const docRef = doc(collection(db, 'notifications'));
            batch.set(docRef, {
                userId,
                message,
                action,
                seen: false,
                createdAt: now.toISOString(),
                expiresAt: expiresAt.toISOString(),
            });
        }
        await batch.commit();
    },

    /** Mark all unseen notifications as seen */
    async markAllAsSeen(): Promise<void> {
        const unseen = notifications.filter((n) => !n.seen);
        if (unseen.length === 0) return;

        const batch = writeBatch(db);
        for (const n of unseen) {
            const docRef = doc(db, 'notifications', n.id);
            batch.update(docRef, { seen: true });
        }
        await batch.commit();
    },

    subscribe(listener: () => void): () => void {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
};
