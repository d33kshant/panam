import { useState, useEffect, useMemo } from 'react';
import { IonCard, IonCardContent, IonIcon, IonListHeader, IonLabel } from '@ionic/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TransactionService, Transaction } from '../services/TransactionService';
import { CategoryService, Category } from '../services/CategoryService';
import receiptIcon from './icons/receipt.svg';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function getWeekTransactions(transactions: Transaction[]): Transaction[] {
    const { start, end } = getWeekRange();
    return transactions.filter((tx) => {
        const txDate = new Date(tx.date + 'T00:00:00');
        return tx.type === 'expense' && txDate >= start && txDate <= end;
    });
}

const WeekChart: React.FC = () => {
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

    const weekTransactions = useMemo(() => getWeekTransactions(transactions), [transactions]);

    const chartData = useMemo(() => {
        // Build a map: categoryId -> { name, icon, dayAmounts[7] }
        const catMap = new Map<number, { name: string; icon: string; amounts: number[]; total: number }>();

        categories.forEach((cat) => {
            catMap.set(cat.id, { name: cat.name, icon: cat.icon, amounts: new Array(7).fill(0), total: 0 });
        });

        weekTransactions.forEach((tx) => {
            const txDate = new Date(tx.date + 'T00:00:00');
            const dayIndex = txDate.getDay();
            const catId = tx.categoryId || 6; // default to Misc
            if (catMap.has(catId)) {
                const entry = catMap.get(catId)!;
                entry.amounts[dayIndex] += tx.amount;
                entry.total += tx.amount;
            }
        });

        // Only include categories that have at least one non-zero amount
        const activeCats = Array.from(catMap.entries())
            .filter(([, data]) => data.amounts.some((a) => a > 0))
            // Sort by total ascending so smallest category is on top (first dataset = bottom of stack)
            // We reverse so the smallest total is last dataset = rendered on top
            .sort((a, b) => b[1].total - a[1].total);

        const datasets = activeCats.map(([, data], index) => ({
            label: data.name,
            data: data.amounts,
            backgroundColor: DEFAULT_PALETTE[index % DEFAULT_PALETTE.length],
            borderRadius: 0,
            borderSkipped: false as const,
        }));

        return {
            labels: DAYS,
            datasets,
        };
    }, [weekTransactions, categories]);

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
                        return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: textColor,
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                stacked: true,
                grid: {
                    color: 'rgba(150, 150, 150, 0.2)',
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: textColor,
                    maxTicksLimit: 5,
                    font: {
                        size: 11,
                    },
                    callback: (value: any) => `₹${value}`,
                },
                beginAtZero: true,
            },
        },
    }), []);

    return (
        <IonCard>
            <IonListHeader>
                <IonLabel><h2><strong>This Week</strong></h2></IonLabel>
            </IonListHeader>
            <div style={{ padding: '0 16px 16px 16px', height: '260px' }}>
                {chartData.datasets.length === 0 ? (
                    <IonCardContent className="ion-text-center ion-padding" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}>
                        <IonIcon icon={receiptIcon} size="large" color="medium" />
                        <h3>No expenses this week</h3>
                        <p>Start adding transactions to see them here.</p>
                    </IonCardContent>
                ) : (
                    <Bar data={chartData} options={options} />
                )}
            </div>
        </IonCard>
    );
};

export default WeekChart;
