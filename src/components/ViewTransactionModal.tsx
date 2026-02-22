import { useState, useEffect } from 'react';
import {
    IonModal,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonList,
} from '@ionic/react';
import removeIcon from './icons/remove.svg';
import checkIcon from './icons/check.svg';
import { Transaction, TransactionService } from '../services/TransactionService';
import { Category, CategoryService } from '../services/CategoryService';

interface ViewTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

const ViewTransactionModal: React.FC<ViewTransactionModalProps> = ({ isOpen, onClose, transaction }) => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [date, setDate] = useState('');
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [categories, setCategories] = useState<Category[]>(CategoryService.getAll());

    useEffect(() => {
        const unsubscribe = CategoryService.subscribe(() => {
            setCategories(CategoryService.getAll());
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (isOpen && transaction) {
            setTitle(transaction.title);
            setSubtitle(transaction.subtitle);
            setAmount(String(transaction.amount));
            setType(transaction.type);
            setDate(transaction.date);
            setCategoryId(transaction.categoryId);
        }
    }, [isOpen, transaction]);

    // ── Validation ────────────────────────────────────────────────
    const errors: string[] = [];
    if (!title.trim()) errors.push('Title is required');
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) errors.push('Amount is required');
    if (!date) errors.push('Date is required');
    const isValid = errors.length === 0 && !!transaction;

    const handleUpdate = async () => {
        if (!isValid) return;
        const data: any = {
            title,
            subtitle,
            amount: parseFloat(amount) || 0,
            type,
            date,
        };

        // For updates, we might want to allow removing a category, but for now we'll just set it if it exists.
        // Actually, if Firebase fails on `undefined`, we could use `null` if the user wants to clear it.
        // But since Ionic Select doesn't output null for undefined category, we can just omit it if undefined.
        // Or if we want to delete it: `import { deleteField } from 'firebase/firestore'` (if we could, but let's just assign).
        // Let's just avoid passing `undefined`.
        if (categoryId !== undefined) {
            data.categoryId = categoryId;
        }

        await TransactionService.update(transaction.id, data);
        onClose();
    };

    const handleDelete = async () => {
        if (!transaction) return;
        await TransactionService.delete(transaction.id);
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>View Transaction</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    <IonItem>
                        <IonInput
                            label="Title"
                            labelPlacement="stacked"
                            value={title}
                            onIonInput={(e) => setTitle(e.detail.value || '')}
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="Description"
                            labelPlacement="stacked"
                            value={subtitle}
                            onIonInput={(e) => setSubtitle(e.detail.value || '')}
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="Amount"
                            labelPlacement="stacked"
                            type="number"
                            value={amount}
                            onIonInput={(e) => setAmount(e.detail.value || '')}
                        />
                    </IonItem>
                    <IonItem>
                        <IonSelect
                            label="Type"
                            labelPlacement="stacked"
                            value={type}
                            onIonChange={(e) => setType(e.detail.value)}
                        >
                            <IonSelectOption value="income">Income</IonSelectOption>
                            <IonSelectOption value="expense">Expense</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonSelect
                            label="Category"
                            labelPlacement="stacked"
                            value={categoryId}
                            onIonChange={(e) => setCategoryId(e.detail.value)}
                        >
                            {categories.map((cat) => (
                                <IonSelectOption key={cat.id} value={cat.id}>
                                    {cat.name}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="Date"
                            labelPlacement="stacked"
                            type="date"
                            value={date}
                            onIonInput={(e) => setDate(e.detail.value || '')}
                        />
                    </IonItem>
                    {errors.length > 0 && (
                        <IonItem>
                            <IonLabel color="danger" className="ion-text-center">
                                {errors.join(' • ')}
                            </IonLabel>
                        </IonItem>
                    )}
                </IonList>
            </IonContent>

            <IonFooter>
                <IonToolbar>
                    <div className="ion-padding" style={{ display: 'flex', gap: '12px' }}>
                        <IonButton expand="block" onClick={handleUpdate} disabled={!isValid} style={{ flex: 1, margin: 0 }}>
                            <IonIcon slot="start" icon={checkIcon} />
                            Save
                        </IonButton>
                        <IonButton expand="block" color="danger" onClick={handleDelete} style={{ flex: 1, margin: 0 }}>
                            <IonIcon slot="start" icon={removeIcon} />
                            Delete
                        </IonButton>
                    </div>
                </IonToolbar>
            </IonFooter>
        </IonModal>
    );
};

export default ViewTransactionModal;
