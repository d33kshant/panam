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
    IonSelect,
    IonSelectOption,
    IonList,
} from '@ionic/react';
import addIcon from './icons/add.svg';
import { TransactionService } from '../services/TransactionService';
import { Category, CategoryService } from '../services/CategoryService';
import { useAuth } from '../contexts/AuthContext';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [categories, setCategories] = useState<Category[]>(CategoryService.getAll());

    useEffect(() => {
        const unsubCat = CategoryService.subscribe(() => {
            setCategories(CategoryService.getAll());
        });
        return () => {
            unsubCat();
        };
    }, []);

    const handleAdd = async () => {
        if (!title || !amount || !user) return;

        const data: any = {
            title,
            subtitle,
            amount: parseFloat(amount) || 0,
            type,
            date,
            author: user.uid,
        };

        if (categoryId) data.categoryId = categoryId;

        await TransactionService.create(data);

        // Reset form
        setTitle('');
        setSubtitle('');
        setAmount('');
        setType('expense');
        setDate(new Date().toISOString().split('T')[0]);
        setCategoryId(undefined);
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Add Transaction</IonTitle>
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
                            placeholder="e.g. Grocery Shopping"
                            value={title}
                            onIonInput={(e) => setTitle(e.detail.value || '')}
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="Description"
                            labelPlacement="stacked"
                            placeholder="e.g. Bought vegetables"
                            value={subtitle}
                            onIonInput={(e) => setSubtitle(e.detail.value || '')}
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="Amount"
                            labelPlacement="stacked"
                            type="number"
                            placeholder="0"
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
            </IonContent>

            <IonFooter>
                <IonToolbar>
                    <div className="ion-padding">
                        <IonButton expand="block" onClick={handleAdd}>
                            <IonIcon slot="start" icon={addIcon} />
                            Add
                        </IonButton>
                    </div>
                </IonToolbar>
            </IonFooter>
        </IonModal>
    );
};

export default AddTransactionModal;
