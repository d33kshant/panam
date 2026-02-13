import { useState } from 'react';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import Transactions from '../components/Transactions';
import AddTransactionModal from '../components/AddTransactionModal';

const Money: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Money</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Money</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <Transactions />
                <IonFab slot="fixed" vertical="bottom" horizontal="end" className="ion-margin">
                    <IonFabButton size="small" onClick={() => setIsModalOpen(true)}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
            <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </IonPage>
    );
};

export default Money;
