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
import { Category, CategoryService, categoryIcons } from '../services/CategoryService';

interface ViewCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({ isOpen, onClose, category }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('food');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (isOpen && category) {
            setName(category.name);
            setDescription(category.description);
            setIcon(category.icon);
            setAmount(String(category.amount || 0));
        }
    }, [isOpen, category]);

    // ── Validation ────────────────────────────────────────────────
    const errors: string[] = [];
    if (!name.trim()) errors.push('Name is required');
    const parsedBudget = parseFloat(amount);
    if (amount && (isNaN(parsedBudget) || parsedBudget < 0)) errors.push('Budget must be ≥ 0');
    const isValid = errors.length === 0 && !!category;

    const handleUpdate = async () => {
        if (!isValid) return;
        await CategoryService.update(category.id, {
            name,
            description,
            icon,
            amount: parseFloat(amount) || 0,
        });
        onClose();
    };

    const handleDelete = async () => {
        if (!category) return;
        await CategoryService.delete(category.id);
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>View Category</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    <IonItem>
                        <IonInput
                            label="Name"
                            labelPlacement="stacked"
                            value={name}
                            onIonInput={(e) => setName(e.detail.value || '')}
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="Description"
                            labelPlacement="stacked"
                            value={description}
                            onIonInput={(e) => setDescription(e.detail.value || '')}
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="Monthly Budget"
                            labelPlacement="stacked"
                            type="number"
                            value={amount}
                            onIonInput={(e) => setAmount(e.detail.value || '')}
                        />
                    </IonItem>
                    <IonItem>
                        <IonSelect
                            label="Icon"
                            labelPlacement="stacked"
                            value={icon}
                            onIonChange={(e) => setIcon(e.detail.value)}
                        >
                            {Object.keys(categoryIcons).map((key) => (
                                <IonSelectOption key={key} value={key}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
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

export default ViewCategoryModal;
