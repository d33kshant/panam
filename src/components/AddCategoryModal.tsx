import { useState } from 'react';
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
    IonInput,
    IonSelect,
    IonSelectOption,
    IonList,
} from '@ionic/react';
import addIcon from './icons/add.svg';
import { CategoryService, categoryIcons } from '../services/CategoryService';

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('food');

    const handleAdd = () => {
        if (!name) return;
        CategoryService.create({
            name,
            description,
            icon,
        });
        // Reset form
        setName('');
        setDescription('');
        setIcon('food');
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Add Category</IonTitle>
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
                            placeholder="e.g. Entertainment"
                            value={name}
                            onIonInput={(e) => setName(e.detail.value || '')}
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="Description"
                            labelPlacement="stacked"
                            placeholder="e.g. Movies, games, etc."
                            value={description}
                            onIonInput={(e) => setDescription(e.detail.value || '')}
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
                </IonList>

                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                }}>
                    <IonButton expand="block" onClick={handleAdd}>
                        <IonIcon slot="start" icon={addIcon} />
                        Add
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default AddCategoryModal;
