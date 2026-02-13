import { useState, useEffect } from 'react';
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
import { Transaction, TransactionService } from '../services/TransactionService';

interface TransactionsProps {
    onTransactionClick?: (transaction: Transaction) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ onTransactionClick }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(TransactionService.getAll());

    useEffect(() => {
        const unsubscribe = TransactionService.subscribe(() => {
            setTransactions(TransactionService.getAll());
        });
        return unsubscribe;
    }, []);

    const formatAmount = (tx: Transaction) => {
        const prefix = tx.type === 'income' ? '+' : '-';
        return `${prefix} ₹${tx.amount.toLocaleString()}`;
    };

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
                        <IonItem
                            key={tx.id}
                            button
                            detail
                            onClick={() => onTransactionClick?.(tx)}
                        >
                            <IonAvatar slot="start">
                                <IonSkeletonText />
                            </IonAvatar>
                            <IonLabel>
                                <h3>{tx.title}</h3>
                                <p>{tx.subtitle}</p>
                            </IonLabel>
                            <IonLabel
                                slot="end"
                                color={tx.type === 'income' ? 'success' : 'danger'}
                            >
                                {formatAmount(tx)}
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            )}
        </IonCard>
    );
};

export default Transactions;
