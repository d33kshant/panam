import { useState, useEffect, useMemo } from 'react';
import { IonCard, IonCardContent, IonIcon, IonListHeader, IonLabel } from '@ionic/react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { TransactionService, Transaction } from '../services/TransactionService';
import { CategoryService, Category } from '../services/CategoryService';
import receiptIcon from './icons/receipt.svg';

ChartJS.register(ArcElement, Tooltip, Legend);

const DEFAULT_PALETTE = [
    'rgb(54, 162, 235)',
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(231, 76, 60)',
    'rgb(46, 204, 113)',
    'rgb(52, 73, 94)',
    'rgb(241, 196, 15)',
    'rgb(26, 188, 156)',
    'rgb(155, 89, 182)',
    'rgb(230, 126, 34)',
    'rgb(22, 160, 133)',
    'rgb(192, 57, 43)',
];

function getMonthTransactions(transactions: Transaction[]): Transaction[] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return transactions.filter((tx) => {
        const txDate = new Date(tx.date + 'T00:00:00');
        return tx.type === 'expense' && txDate.getFullYear() === year && txDate.getMonth() === month;
    });
}

const MonthChart: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>(TransactionService.getAll());
    const [categories, setCategories] = useState<Category[]>(CategoryService.getAll());

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

    const chartData = useMemo(() => {
        // Build a map: categoryId -> { name, total }
        const catMap = new Map<string, { name: string; total: number }>();

        categories.forEach((cat) => {
            catMap.set(cat.id, { name: cat.name, total: 0 });
        });

        monthTransactions.forEach((tx) => {
            const catId = tx.categoryId || '';
            if (catMap.has(catId)) {
                const entry = catMap.get(catId)!;
                entry.total += tx.amount;
            }
        });

        // Only include categories that have a non-zero total
        const activeCats = Array.from(catMap.entries())
            .filter(([, data]) => data.total > 0)
            .sort((a, b) => b[1].total - a[1].total);

        const labels = activeCats.map(([, data]) => data.name);
        const data = activeCats.map(([, data]) => data.total);
        const backgroundColor = activeCats.map((_, index) => DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor,
                    borderWidth: 0,
                },
            ],
        };
    }, [monthTransactions, categories]);

    const textColor = useMemo(() => {
        return getComputedStyle(document.documentElement)
            .getPropertyValue('--ion-text-color-step-400').trim() || '#333';
    }, []);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    color: textColor,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 16,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                        const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
                        return `${context.label}: ₹${context.parsed.toLocaleString()} (${percentage}%)`;
                    },
                },
            },
        },
    }), []);

    const hasData = chartData.datasets[0].data.length > 0;

    return (
        <IonCard>
            <IonListHeader>
                <IonLabel><h2><strong>This Month</strong></h2></IonLabel>
            </IonListHeader>
            <div style={{ padding: '0 16px 16px 16px', height: '260px' }}>
                {!hasData ? (
                    <IonCardContent className="ion-text-center ion-padding" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}>
                        <IonIcon icon={receiptIcon} size="large" color="medium" />
                        <h3>No expenses this month</h3>
                        <p>Start adding transactions to see them here.</p>
                    </IonCardContent>
                ) : (
                    <Pie data={chartData} options={options} />
                )}
            </div>
        </IonCard>
    );
};

export default MonthChart;
