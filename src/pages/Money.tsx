import { useState } from 'react';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import Transactions from '../components/Transactions';
import AddTransactionModal from '../components/AddTransactionModal';
import ViewTransactionModal from '../components/ViewTransactionModal';
import { Transaction } from '../services/TransactionService';

const Money: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsViewModalOpen(true);
    };

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
                <Transactions onTransactionClick={handleTransactionClick} limit={10} />
                <IonFab slot="fixed" vertical="bottom" horizontal="end" className="ion-margin">
                    <IonFabButton size="small" onClick={() => setIsAddModalOpen(true)}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
            <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <ViewTransactionModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                transaction={selectedTransaction}
            />
        </IonPage>
    );
};

export default Money;
