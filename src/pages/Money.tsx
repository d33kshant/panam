import { useState } from 'react';
import { IonContent, IonButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import addIcon from '../components/icons/add.svg';
import Groups from '../components/Groups';
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
                <Groups limit={5} />
                <Transactions onTransactionClick={handleTransactionClick} limit={10} />
                <div style={{
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    zIndex: 1000,
                }}>
                    <IonButton shape="round" onClick={() => setIsAddModalOpen(true)}>
                        <IonIcon slot="start" icon={addIcon} />
                        Add A Transaction
                    </IonButton>
                </div>
            </IonContent>
            <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} showGroupField={false} />
            <ViewTransactionModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                transaction={selectedTransaction}
            />
        </IonPage>
    );
};

export default Money;
