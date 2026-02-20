import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    onSnapshot,
    query,
    where,
    arrayUnion,
    arrayRemove,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Group {
    id: string;
    name: string;
    members: string[];
    author: string;
}

let groups: Group[] = [];
let listeners: (() => void)[] = [];
let firestoreUnsubscribe: Unsubscribe | null = null;
let currentUserId: string | null = null;

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

export const GroupService = {
    /** Start listening to groups where the user is a member */
    listen(userId: string) {
        if (currentUserId === userId && firestoreUnsubscribe) return;

        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
        }

        currentUserId = userId;
        const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));

        firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
            groups = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Group[];
            notifyListeners();
        }, (error) => {
            console.error('GroupService onSnapshot error:', error);
        });
    },

    /** Stop listening (call on logout) */
    stopListening() {
        if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
            firestoreUnsubscribe = null;
        }
        currentUserId = null;
        groups = [];
        notifyListeners();
    },

    getAll(): Group[] {
        return [...groups];
    },

    getById(id: string): Group | undefined {
        return groups.find((g) => g.id === id);
    },

    async create(data: Omit<Group, 'id'>): Promise<Group> {
        const docRef = await addDoc(collection(db, 'groups'), data);
        const newGroup = { ...data, id: docRef.id };
        // Optimistic update: add to local cache immediately
        if (!groups.find((g) => g.id === newGroup.id)) {
            groups.push(newGroup);
            notifyListeners();
        }
        return newGroup;
    },

    async update(id: string, data: Partial<Omit<Group, 'id'>>): Promise<void> {
        const docRef = doc(db, 'groups', id);
        await updateDoc(docRef, data);
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, 'groups', id);
        await deleteDoc(docRef);
    },

    /** Join an existing group by its ID */
    async joinGroup(groupId: string, userId: string): Promise<void> {
        const docRef = doc(db, 'groups', groupId);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) {
            throw new Error('Group not found. Please check the Group ID.');
        }
        const members = snapshot.data().members || [];
        if (members.includes(userId)) {
            throw new Error('You are already a member of this group.');
        }
        await updateDoc(docRef, {
            members: arrayUnion(userId),
        });
    },

    /** Leave a group; deletes it if no members remain */
    async leaveGroup(groupId: string, userId: string): Promise<void> {
        const docRef = doc(db, 'groups', groupId);
        await updateDoc(docRef, {
            members: arrayRemove(userId),
        });
        // Check if group is now empty
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (!data.members || data.members.length === 0) {
                await deleteDoc(docRef);
            }
        }
    },

    subscribe(listener: () => void): () => void {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
};
