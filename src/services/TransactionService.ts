export interface Transaction {
    id: number;
    title: string;
    subtitle: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
}

let nextId = 4;

let transactions: Transaction[] = [];

let listeners: (() => void)[] = [];

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

export const TransactionService = {
    getAll(): Transaction[] {
        return [...transactions];
    },

    getById(id: number): Transaction | undefined {
        return transactions.find((tx) => tx.id === id);
    },

    create(data: Omit<Transaction, 'id'>): Transaction {
        const newTransaction: Transaction = { ...data, id: nextId++ };
        transactions = [newTransaction, ...transactions];
        notifyListeners();
        return newTransaction;
    },

    update(id: number, data: Partial<Omit<Transaction, 'id'>>): Transaction | undefined {
        const index = transactions.findIndex((tx) => tx.id === id);
        if (index === -1) return undefined;
        transactions[index] = { ...transactions[index], ...data };
        transactions = [...transactions];
        notifyListeners();
        return transactions[index];
    },

    delete(id: number): boolean {
        const initialLength = transactions.length;
        transactions = transactions.filter((tx) => tx.id !== id);
        if (transactions.length !== initialLength) {
            notifyListeners();
            return true;
        }
        return false;
    },

    subscribe(listener: () => void): () => void {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
};
