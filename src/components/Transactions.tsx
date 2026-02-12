import {
    IonCard,
    IonCardContent,
    IonIcon,
    IonList,
    IonListHeader,
    IonLabel,
    IonButton,
    IonItem,
    IonAvatar,
    IonSkeletonText,
} from '@ionic/react';
import receiptIcon from './icons/receipt.svg';

interface Transaction {
    id: number;
    title: string;
    subtitle: string;
    amount: string;
}

const transactions: Transaction[] = [];

const Transactions: React.FC = () => {
    return (
        <IonCard>
            <IonListHeader>
                <IonLabel><h2><strong>Transactions</strong></h2></IonLabel>
                <IonButton>See all</IonButton>
            </IonListHeader>
            {transactions.length === 0 ? (
                <IonCardContent className="ion-text-center ion-padding">
                    <IonIcon icon={receiptIcon} size="large" color="medium" />
                    <h3>No transactions yet</h3>
                    <p>Start adding transactions to see them here.</p>
                </IonCardContent>
            ) : (
                <IonList>
                    {transactions.map((tx) => (
                        <IonItem key={tx.id} button detail>
                            <IonAvatar slot="start">
                                <IonSkeletonText />
                            </IonAvatar>
                            <IonLabel>
                                <h3>{tx.title}</h3>
                                <p>{tx.subtitle}</p>
                            </IonLabel>
                            <IonLabel slot="end">{tx.amount}</IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            )}
        </IonCard>
    );
};

export default Transactions;
