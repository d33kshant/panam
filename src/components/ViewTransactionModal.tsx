import { useState, useEffect } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
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
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
    const [categories, setCategories] = useState<Category[]>(CategoryService.getAll());

    useEffect(() => {
        const unsubscribe = CategoryService.subscribe(() => {
            setCategories(CategoryService.getAll());
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (transaction) {
            setTitle(transaction.title);
            setSubtitle(transaction.subtitle);
            setAmount(String(transaction.amount));
            setType(transaction.type);
            setDate(transaction.date);
            setCategoryId(transaction.categoryId);
        }
    }, [transaction]);

    const handleUpdate = () => {
        if (!transaction) return;
        TransactionService.update(transaction.id, {
            title,
            subtitle,
            amount: parseFloat(amount) || 0,
            type,
            date,
            categoryId,
        });
        onClose();
    };

    const handleDelete = () => {
        if (!transaction) return;
        TransactionService.delete(transaction.id);
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
                </IonList>

                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    display: 'flex',
                    gap: '12px',
                }}>
                    <IonButton expand="block" onClick={handleUpdate} style={{ flex: 1 }}>
                        <IonIcon slot="start" icon={checkIcon} />
                        Save
                    </IonButton>
                    <IonButton expand="block" color="danger" onClick={handleDelete} style={{ flex: 1 }}>
                        <IonIcon slot="start" icon={removeIcon} />
                        Delete
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default ViewTransactionModal;
