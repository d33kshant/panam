import { useState, useEffect, useMemo } from 'react';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSearchbar,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import receiptIcon from '../components/icons/receipt.svg';
import AddTransactionModal from '../components/AddTransactionModal';
import ViewTransactionModal from '../components/ViewTransactionModal';
import { Transaction, TransactionService } from '../services/TransactionService';
import { CategoryService, categoryIcons } from '../services/CategoryService';

const TransactionsPage: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>(TransactionService.getAll());
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const unsubscribe = TransactionService.subscribe(() => {
            setTransactions(TransactionService.getAll());
        });
        return unsubscribe;
    }, []);

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsViewModalOpen(true);
    };

    const formatAmount = (tx: Transaction) => {
        const prefix = tx.type === 'income' ? '+' : '-';
        return `${prefix} ₹${tx.amount.toLocaleString()}`;
    };

    const getCategoryIcon = (categoryId?: number) => {
        if (!categoryId) return null;
        const category = CategoryService.getById(categoryId);
        if (!category) return null;
        return categoryIcons[category.icon];
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return '';
        const category = CategoryService.getById(categoryId);
        return category?.name ?? '';
    };

    const filteredTransactions = useMemo(() => {
        if (!searchText.trim()) return transactions;
        const query = searchText.toLowerCase().trim();
        return transactions.filter((tx) => {
            const categoryName = getCategoryName(tx.categoryId);
            return (
                tx.title.toLowerCase().includes(query) ||
                tx.subtitle.toLowerCase().includes(query) ||
                tx.amount.toString().includes(query) ||
                categoryName.toLowerCase().includes(query)
            );
        });
    }, [transactions, searchText]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/money" />
                    </IonButtons>
                    <IonTitle>Transactions</IonTitle>
                </IonToolbar>
                <IonToolbar>
                    <IonSearchbar
                        value={searchText}
                        onIonInput={(e) => setSearchText(e.detail.value ?? '')}
                        placeholder="Search by name, description, amount or category"
                        debounce={250}
                    />
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonCard>
                    {filteredTransactions.length === 0 ? (
                        <IonCardContent className="ion-text-center ion-padding">
                            <p>No results found matching your query.</p>
                        </IonCardContent>
                    ) : (
                        <IonList>
                            {filteredTransactions.map((tx) => {
                                const catIcon = getCategoryIcon(tx.categoryId);
                                return (
                                    <IonItem
                                        key={tx.id}
                                        button
                                        detail
                                        onClick={() => handleTransactionClick(tx)}
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
                                            color={tx.type === 'income' ? 'success' : 'danger'}
                                        >
                                            {formatAmount(tx)}
                                        </IonLabel>
                                    </IonItem>
                                );
                            })}
                        </IonList>
                    )}
                </IonCard>
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

export default TransactionsPage;
