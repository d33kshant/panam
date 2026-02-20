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
} from '@ionic/react';
import receiptIcon from './icons/receipt.svg';
import { Transaction, TransactionService } from '../services/TransactionService';
import { CategoryService, categoryIcons } from '../services/CategoryService';

interface TransactionsProps {
    onTransactionClick?: (transaction: Transaction) => void;
    limit?: number;
}

const Transactions: React.FC<TransactionsProps> = ({ onTransactionClick, limit }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(TransactionService.getAll());

    useEffect(() => {
        const unsubscribe = TransactionService.subscribe(() => {
            setTransactions(TransactionService.getAll());
        });
        return unsubscribe;
    }, []);

    const formatAmount = (tx: Transaction) => {
        const prefix = tx.type === 'income' ? '+ ' : '';
        return `${prefix}₹${tx.amount.toLocaleString()}`;
    };

    const getCategoryIcon = (categoryId?: string) => {
        if (!categoryId) return null;
        const category = CategoryService.getById(categoryId);
        if (!category) return null;
        return categoryIcons[category.icon];
    };

    return (
        <IonCard>
            <IonListHeader>
                <IonLabel><h2><strong>Transactions</strong></h2></IonLabel>
                {limit && (
                    <IonButton routerLink="/money/transactions">See all</IonButton>
                )}
            </IonListHeader>
            {transactions.length === 0 ? (
                <IonCardContent className="ion-text-center ion-padding">
                    <IonIcon icon={receiptIcon} size="large" color="medium" />
                    <h3>No transactions yet</h3>
                    <p>Start adding transactions to see them here.</p>
                </IonCardContent>
            ) : (
                <IonList>
                    {(limit ? transactions.slice(0, limit) : transactions).map((tx) => {
                        const catIcon = getCategoryIcon(tx.categoryId);
                        return (
                            <IonItem
                                key={tx.id}
                                button
                                detail
                                onClick={() => onTransactionClick?.(tx)}
                            >
                                <IonAvatar slot="start" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--ion-background-color-step-200)',
                                }}>
                                    {catIcon ? (
                                        <IonIcon icon={catIcon} />
                                    ) : (
                                        <IonIcon icon={receiptIcon} />
                                    )}
                                </IonAvatar>
                                <IonLabel>
                                    <h3>{tx.title}</h3>
                                    <p>{tx.subtitle}</p>
                                </IonLabel>
                                <IonLabel
                                    slot="end"
                                    color={tx.type === 'income' ? 'success' : undefined}
                                >
                                    {formatAmount(tx)}
                                </IonLabel>
                            </IonItem>
                        );
                    })}
                </IonList>
            )}
        </IonCard>
    );
};

export default Transactions;
