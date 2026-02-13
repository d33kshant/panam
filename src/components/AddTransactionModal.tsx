import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
} from '@ionic/react';
import addIcon from './icons/add.svg';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
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
                <p>This is where you can add a new transaction. Fill in the details below.</p>

                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                }}>
                    <IonButton expand="block">
                        <IonIcon slot="start" icon={addIcon} />
                        Add
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default AddTransactionModal;
