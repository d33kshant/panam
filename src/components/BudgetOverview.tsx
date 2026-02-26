import { useState, useEffect, useMemo } from 'react';
import { IonCard, IonChip, IonLabel, IonListHeader } from '@ionic/react';
import { TransactionService, Transaction } from '../services/TransactionService';
import { CategoryService, Category, MISC_CATEGORY } from '../services/CategoryService';

function getMonthTransactions(transactions: Transaction[]): Transaction[] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return transactions.filter((tx) => {
        const txDate = new Date(tx.date + 'T00:00:00');
        return tx.type === 'expense' && txDate.getFullYear() === year && txDate.getMonth() === month;
    });
}

const BudgetOverview: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(TransactionService.getAll());
    const [categories, setCategories] = useState<Category[]>(CategoryService.getAll());
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

    useEffect(() => {
        const unsubTx = TransactionService.subscribe(() => {
            setTransactions(TransactionService.getAll());
        });
        const unsubCat = CategoryService.subscribe(() => {
            setCategories(CategoryService.getAll());
        });
        return () => {
            unsubTx();
            unsubCat();
        };
    }, []);

    const monthTransactions = useMemo(() => getMonthTransactions(transactions), [transactions]);

    const budgetCategories = useMemo(
        () => categories.filter((cat) => cat.id !== MISC_CATEGORY.id && cat.amount > 0),
        [categories],
    );

    const budgetCategoryIds = useMemo(
        () => new Set(budgetCategories.map((cat) => cat.id)),
        [budgetCategories],
    );

    const { spent, budget } = useMemo(() => {
        if (selectedCategoryId === 'all') {
            const totalSpent = monthTransactions
                .filter((tx) => tx.categoryId && budgetCategoryIds.has(tx.categoryId))
                .reduce((sum, tx) => sum + tx.amount, 0);
            const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
            return { spent: totalSpent, budget: totalBudget };
        }

        const categorySpent = monthTransactions
            .filter((tx) => tx.categoryId === selectedCategoryId)
            .reduce((sum, tx) => sum + tx.amount, 0);

        const category = budgetCategories.find((cat) => cat.id === selectedCategoryId);
        const categoryBudget = category ? category.amount : 0;

        return { spent: categorySpent, budget: categoryBudget };
    }, [monthTransactions, budgetCategories, budgetCategoryIds, selectedCategoryId]);

    return (
        <IonCard style={{ ...style, display: 'flex', flexDirection: 'column' as const }}>
            <IonListHeader>
                <IonLabel><h2><strong>Budget Overview</strong></h2></IonLabel>
            </IonListHeader>
            <div style={{
                display: 'flex',
                overflowX: 'auto',
                padding: '0 16px',
                gap: '4px',
                whiteSpace: 'nowrap',
            }}>
                <IonChip
                    outline={selectedCategoryId !== 'all'}
                    color={selectedCategoryId === 'all' ? 'primary' : undefined}
                    onClick={() => setSelectedCategoryId('all')}
                >
                    <IonLabel>All</IonLabel>
                </IonChip>
                {budgetCategories.map((cat) => (
                    <IonChip
                        key={cat.id}
                        outline={selectedCategoryId !== cat.id}
                        color={selectedCategoryId === cat.id ? 'primary' : undefined}
                        onClick={() => setSelectedCategoryId(cat.id)}
                    >
                        <IonLabel>{cat.name}</IonLabel>
                    </IonChip>
                ))}
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 16px',
                flex: 1,
            }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: spent > budget ? 'var(--ion-color-danger)' : 'var(--ion-color-success)',
                    }}>
                        ₹{spent.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        Spent
                    </div>
                </div>
                <div style={{
                    width: '1px',
                    height: '48px',
                    backgroundColor: 'var(--ion-color-medium)',
                    opacity: 0.4,
                }} />
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        ₹{budget.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        Budget
                    </div>
                </div>
            </div>
        </IonCard>
    );
};

export default BudgetOverview;
