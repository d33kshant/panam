import { useState, useEffect } from 'react';
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
    IonAccordionGroup,
    IonAccordion,
    IonToast,
    IonButton,
} from '@ionic/react';
import { personOutline, checkmarkCircle } from 'ionicons/icons';
import settleIcon from '../components/icons/settle.svg';
import removeIcon from '../components/icons/remove.svg';
import { ExpenseService, Expense } from '../services/ExpenseService';
import { NotificationService } from '../services/NotificationService';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MemberInfo } from './GroupPage';

const ExpensePage: React.FC = () => {
    const { groupId, expenseId } = useParams<{ groupId: string; expenseId: string }>();
    const { user } = useAuth();
    const history = useHistory();
    const [expense, setExpense] = useState<Expense | undefined>(ExpenseService.getById(expenseId));
    const [members, setMembers] = useState<MemberInfo[]>([]);
    const [toastMessage, setToastMessage] = useState('');

    // Listen for expense updates
    useEffect(() => {
        ExpenseService.listen(groupId);
        setExpense(ExpenseService.getById(expenseId));
        const unsubscribe = ExpenseService.subscribe(() => {
            const updated = ExpenseService.getById(expenseId);
            setExpense(updated);
            // If expense was deleted, navigate back
            if (!updated) {
                history.replace(`/money/groups/${groupId}`);
            }
        });
        return () => {
            unsubscribe();
        };
    }, [groupId, expenseId]);

    // Fetch member details from Firestore users collection
    useEffect(() => {
        if (!expense) return;

        const memberUids = Object.keys(expense.splits);
        const fetchMembers = async () => {
            const memberInfos: MemberInfo[] = [];
            for (const uid of memberUids) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        memberInfos.push({
                            uid,
                            name: data.name || 'Unknown',
                            email: data.email || '',
                            avatar: data.avatar || '',
                        });
                    } else {
                        memberInfos.push({ uid, name: uid, email: '', avatar: '' });
                    }
                } catch {
                    memberInfos.push({ uid, name: uid, email: '', avatar: '' });
                }
            }
            setMembers(memberInfos);
        };

        fetchMembers();
    }, [expense?.id, Object.keys(expense?.splits || {}).length]);

    const isAuthor = expense?.createdBy === user?.uid;
    const isUserMember = expense && user ? user.uid in expense.splits : false;
    const isUserSettled = expense && user ? expense.splits[user.uid]?.settled === true : false;

    const handleSettle = async () => {
        if (!expense || !user) return;
        try {
            await ExpenseService.settleMember(expense.id, user.uid);
            // Notify the expense creator
            if (expense.createdBy !== user.uid) {
                const settlerName = user.displayName || 'Someone';
                await NotificationService.sendToMany(
                    [expense.createdBy],
                    `${settlerName} settled "${expense.note}"`,
                    `exp:${groupId}:${expense.id}`,
                );
            }
            setToastMessage('Expense settled!');
        } catch (err: any) {
            setToastMessage(err?.message || 'Failed to settle expense.');
        }
    };

    const handleDelete = async () => {
        if (!expense) return;
        try {
            await ExpenseService.delete(expense.id);
            setToastMessage('Expense deleted.');
        } catch (err: any) {
            setToastMessage(err?.message || 'Failed to delete expense.');
        }
    };

    const formatAmount = (amount: number): string => {
        return `₹${amount.toFixed(2)}`;
    };

    const getMemberName = (uid: string): string => {
        return members.find((m) => m.uid === uid)?.name || 'Unknown';
    };

    if (!expense) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref={`/money/groups/${groupId}`} />
                        </IonButtons>
                        <IonTitle>Expense</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding ion-text-center">
                    <p>Expense not found.</p>
                </IonContent>
            </IonPage>
        );
    }

    const selectedMembers = Object.keys(expense.splits);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/money/groups/${groupId}`} />
                    </IonButtons>
                    <IonTitle>{expense.note}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding">
                {/* Settled banner */}
                {isUserMember && isUserSettled && (
                    <IonItem lines="none">
                        <IonIcon icon={checkmarkCircle} color="success" slot="start" />
                        <IonLabel color="success" style={{ fontWeight: 600 }}>
                            You have settled this expense
                        </IonLabel>
                    </IonItem>
                )}

                <IonAccordionGroup multiple={true} value={['details', 'members', 'final_amount']}>
                    <IonAccordion value="details">
                        <IonItem slot="header" color="light">
                            <IonLabel>Details</IonLabel>
                        </IonItem>
                        <IonList slot="content" className="ion-no-padding ion-no-margin">
                            <IonItem>
                                <IonLabel>
                                    <p>Note</p>
                                    <h3>{expense.note}</h3>
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>
                                    <p>Amount</p>
                                    <h3>{formatAmount(expense.totalAmount)}</h3>
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>
                                    <p>Added by</p>
                                    <h3>{getMemberName(expense.createdBy)}</h3>
                                </IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>
                                    <p>Date</p>
                                    <h3>{new Date(expense.createdAt).toLocaleDateString()}</h3>
                                </IonLabel>
                            </IonItem>
                        </IonList>
                    </IonAccordion>

                    <IonAccordion value="members">
                        <IonItem slot="header" color="light">
                            <IonLabel>Members</IonLabel>
                        </IonItem>
                        <IonList slot="content" className="ion-no-padding ion-no-margin">
                            {members.map((member) => (
                                <IonItem key={member.uid}>
                                    <IonAvatar slot="start" style={{ width: '32px', height: '32px' }}>
                                        {member.avatar ? (
                                            <img src={member.avatar} alt="avatar" />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'var(--ion-background-color-step-200)',
                                            }}>
                                                <IonIcon icon={personOutline} />
                                            </div>
                                        )}
                                    </IonAvatar>
                                    <IonLabel>{member.name}</IonLabel>
                                    {expense.splits[member.uid]?.settled && (
                                        <IonIcon icon={checkmarkCircle} color="success" slot="end" />
                                    )}
                                </IonItem>
                            ))}
                        </IonList>
                    </IonAccordion>

                    <IonAccordion value="final_amount">
                        <IonItem slot="header" color="light">
                            <IonLabel>Final Amount</IonLabel>
                        </IonItem>
                        <IonList slot="content" className="ion-no-padding ion-no-margin">
                            {members
                                .filter((m) => selectedMembers.includes(m.uid))
                                .map((member) => (
                                    <IonItem key={`final_${member.uid}`}>
                                        <IonAvatar slot="start" style={{ width: '32px', height: '32px' }}>
                                            {member.avatar ? (
                                                <img src={member.avatar} alt="avatar" />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'var(--ion-background-color-step-200)',
                                                }}>
                                                    <IonIcon icon={personOutline} />
                                                </div>
                                            )}
                                        </IonAvatar>
                                        <IonLabel>{member.name}</IonLabel>
                                        <div slot="end" style={{
                                            fontWeight: 600,
                                        }}>
                                            {formatAmount(expense.splits[member.uid]?.amount ?? 0)}
                                        </div>
                                    </IonItem>
                                ))}
                        </IonList>
                    </IonAccordion>
                </IonAccordionGroup>

                {/* Delete button - only for the author */}
                {isAuthor && (
                    <div className="ion-padding">
                        <IonButton expand="block" color="danger" onClick={handleDelete}>
                            <IonIcon slot="start" icon={removeIcon} />
                            Delete Expense
                        </IonButton>
                    </div>
                )}

                {/* Settle floating button - only for members who haven't settled */}
                {isUserMember && !isUserSettled && (
                    <div style={{
                        position: 'fixed',
                        bottom: '16px',
                        right: '16px',
                        zIndex: 1000,
                    }}>
                        <IonButton shape="round" onClick={handleSettle}>
                            <IonIcon slot="start" icon={settleIcon} />
                            Settle
                        </IonButton>
                    </div>
                )}
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

export default ExpensePage;
