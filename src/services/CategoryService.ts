export interface Category {
    id: number;
    name: string;
    description: string;
    icon: string;
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

export const DEFAULT_CATEGORY_ID = 6;

let nextId = 7;

let categories: Category[] = [
    { id: 1, name: 'Food', description: 'Dining out and restaurants', icon: 'food' },
    { id: 2, name: 'Transport', description: 'Cab, bus, fuel expenses', icon: 'transport' },
    { id: 3, name: 'Shopping', description: 'Clothing and accessories', icon: 'shopping' },
    { id: 4, name: 'Grocery', description: 'Daily groceries and essentials', icon: 'grocery' },
    { id: 5, name: 'Bills', description: 'Electricity, water, internet', icon: 'bills' },
    { id: 6, name: 'Misc', description: 'Miscellaneous expenses', icon: 'misc' },
];

let listeners: (() => void)[] = [];

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

export const CategoryService = {
    getAll(): Category[] {
        return [...categories];
    },

    getById(id: number): Category | undefined {
        return categories.find((cat) => cat.id === id);
    },

    create(data: Omit<Category, 'id'>): Category {
        const newCategory: Category = { ...data, id: nextId++ };
        categories = [newCategory, ...categories];
        notifyListeners();
        return newCategory;
    },

    update(id: number, data: Partial<Omit<Category, 'id'>>): Category | undefined {
        const index = categories.findIndex((cat) => cat.id === id);
        if (index === -1) return undefined;
        categories[index] = { ...categories[index], ...data };
        categories = [...categories];
        notifyListeners();
        return categories[index];
    },

    delete(id: number): boolean {
        const initialLength = categories.length;
        categories = categories.filter((cat) => cat.id !== id);
        if (categories.length !== initialLength) {
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
