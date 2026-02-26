import { useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonLabel,
    IonList,
    IonItem,
    IonAvatar,
    IonCard,
    IonCardContent,
    IonListHeader,
    useIonActionSheet,
    IonToast,
} from '@ionic/react';
import { personOutline } from 'ionicons/icons';
import receiptIcon from '../components/icons/receipt.svg';
import { ExpenseService, Expense } from '../services/ExpenseService';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MemberInfo } from './GroupPage';

const BalancePage: React.FC = () => {
    const { groupId, memberId } = useParams<{ groupId: string; memberId: string }>();
    const { user } = useAuth();
    const history = useHistory();
    const [presentActionSheet] = useIonActionSheet();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    // Listen for expense updates
    useEffect(() => {
        ExpenseService.listen(groupId);
        setExpenses(ExpenseService.getAll());
        const unsubscribe = ExpenseService.subscribe(() => {
            setExpenses(ExpenseService.getAll());
        });
        return () => {
            unsubscribe();
        };
    }, [groupId]);

    // Fetch selected member details
    useEffect(() => {
        const fetchMember = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', memberId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setMemberInfo({
                        uid: memberId,
                        name: data.name || 'Unknown',
                        email: data.email || '',
                        avatar: data.avatar || '',
                    });
                } else {
                    setMemberInfo({ uid: memberId, name: memberId, email: '', avatar: '' });
                }
            } catch {
                setMemberInfo({ uid: memberId, name: memberId, email: '', avatar: '' });
            }
        };

        fetchMember();
    }, [memberId]);

    const memberName = memberInfo?.name || 'Unknown';

    // Expenses created by the selected member where the current user has an unsettled split
    // → "I owe them"
    const iOweThemExpenses = useMemo(() => {
        if (!user) return [];
        return expenses.filter((expense) => {
            if (expense.createdBy !== memberId) return false;
            const split = expense.splits[user.uid];
            return split && !split.settled;
        });
    }, [expenses, user, memberId]);

    // Expenses created by the current user where the selected member has an unsettled split
    // → "They owe me"
    const theyOweMeExpenses = useMemo(() => {
        if (!user) return [];
        return expenses.filter((expense) => {
            if (expense.createdBy !== user.uid) return false;
            const split = expense.splits[memberId];
            return split && !split.settled;
        });
    }, [expenses, user, memberId]);

    // Net balance = (what they owe me) - (what I owe them)
    // Positive → they owe me, Negative → I owe them
    const { theyOweMe, iOweThem, netBalance } = useMemo(() => {
        if (!user) return { theyOweMe: 0, iOweThem: 0, netBalance: 0 };

        const theyOweMe = theyOweMeExpenses.reduce((sum, expense) => {
            return sum + (expense.splits[memberId]?.amount ?? 0);
        }, 0);

        const iOweThem = iOweThemExpenses.reduce((sum, expense) => {
            return sum + (expense.splits[user.uid]?.amount ?? 0);
        }, 0);

        return {
            theyOweMe: parseFloat(theyOweMe.toFixed(2)),
            iOweThem: parseFloat(iOweThem.toFixed(2)),
            netBalance: parseFloat((theyOweMe - iOweThem).toFixed(2)),
        };
    }, [theyOweMeExpenses, iOweThemExpenses, user, memberId]);

    const hasAnyExpenses = iOweThemExpenses.length > 0 || theyOweMeExpenses.length > 0;

    const getSummaryText = (): string => {
        if (netBalance > 0) return `${memberName} owes you ₹${netBalance.toLocaleString()}`;
        if (netBalance < 0) return `You owe ₹${Math.abs(netBalance).toLocaleString()}`;
        return 'All settled up!';
    };

    const getSummaryColor = (): string => {
        if (netBalance > 0) return 'var(--ion-color-success)';
        if (netBalance < 0) return 'var(--ion-color-danger)';
        return 'var(--ion-color-medium)';
    };

    const handleExpenseClick = (expense: Expense) => {
        const canSettle = user && expense.splits[user.uid] && !expense.splits[user.uid].settled;

        const buttons: any[] = [];

        if (canSettle) {
            buttons.push({
                text: 'Settle',
                handler: async () => {
                    try {
                        await ExpenseService.settleMember(expense.id, user!.uid);
                        setToastMessage('Expense settled!');
                    } catch (err: any) {
                        setToastMessage(err?.message || 'Failed to settle expense.');
                    }
                },
            });
        }

        buttons.push({
            text: 'View Expense',
            handler: () => {
                history.push(`/money/groups/${groupId}/expenses/${expense.id}`);
            },
        });

        buttons.push({ text: 'Cancel', role: 'cancel' });

        presentActionSheet({ buttons });
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/money/groups/${groupId}`} />
                    </IonButtons>
                    <IonTitle>{memberName}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {/* Summary card */}
                <IonCard>
                    <IonCardContent>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}>
                            <IonAvatar style={{
                                width: '56px',
                                height: '56px',
                                minWidth: '56px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--ion-background-color-step-200)',
                            }}>
                                {memberInfo?.avatar ? (
                                    <img src={memberInfo.avatar} alt="avatar" />
                                ) : (
                                    <IonIcon icon={personOutline} style={{ fontSize: '28px' }} />
                                )}
                            </IonAvatar>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--ion-text-color)' }}>
                                    {memberName}
                                </h2>
                                <p style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    color: getSummaryColor(),
                                    fontWeight: 600,
                                }}>
                                    {getSummaryText()}
                                </p>
                            </div>
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Full ledger */}
                <IonCard>
                    {!hasAnyExpenses ? (
                        <IonCardContent className="ion-text-center ion-padding">
                            <p>No unsettled expenses with {memberName}.</p>
                        </IonCardContent>
                    ) : (
                        <IonList>
                            {/* "You owe" section */}
                            {iOweThemExpenses.length > 0 && (
                                <>
                                    <IonListHeader>
                                        <IonLabel color="danger">You owe — ₹{iOweThem.toLocaleString()}</IonLabel>
                                    </IonListHeader>
                                    {iOweThemExpenses.map((expense) => (
                                        <IonItem
                                            key={expense.id}
                                            button
                                            onClick={() => handleExpenseClick(expense)}
                                        >
                                            <IonAvatar slot="start" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'var(--ion-background-color-step-200)',
                                            }}>
                                                <IonIcon icon={receiptIcon} />
                                            </IonAvatar>
                                            <IonLabel>
                                                <h3>{expense.note}</h3>
                                                <p>{new Date(expense.createdAt).toLocaleDateString()}</p>
                                            </IonLabel>
                                            <IonLabel slot="end" color="danger" style={{ fontWeight: 600 }}>
                                                ₹{(expense.splits[user!.uid]?.amount ?? 0).toLocaleString()}
                                            </IonLabel>
                                        </IonItem>
                                    ))}
                                </>
                            )}

                            {/* "They owe you" section */}
                            {theyOweMeExpenses.length > 0 && (
                                <>
                                    <IonListHeader>
                                        <IonLabel color="success">{memberName} owes — ₹{theyOweMe.toLocaleString()}</IonLabel>
                                    </IonListHeader>
                                    {theyOweMeExpenses.map((expense) => (
                                        <IonItem
                                            key={expense.id}
                                            button
                                            onClick={() => handleExpenseClick(expense)}
                                        >
                                            <IonAvatar slot="start" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'var(--ion-background-color-step-200)',
                                            }}>
                                                <IonIcon icon={receiptIcon} />
                                            </IonAvatar>
                                            <IonLabel>
                                                <h3>{expense.note}</h3>
                                                <p>{new Date(expense.createdAt).toLocaleDateString()}</p>
                                            </IonLabel>
                                            <IonLabel slot="end" color="success" style={{ fontWeight: 600 }}>
                                                ₹{(expense.splits[memberId]?.amount ?? 0).toLocaleString()}
                                            </IonLabel>
                                        </IonItem>
                                    ))}
                                </>
                            )}
                        </IonList>
                    )}
                </IonCard>
            </IonContent>

            <IonToast
                isOpen={!!toastMessage}
                message={toastMessage}
                duration={2000}
                onDidDismiss={() => setToastMessage('')}
            />
        </IonPage>
    );
};

export default BalancePage;
