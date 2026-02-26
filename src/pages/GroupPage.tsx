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
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonAvatar,
    IonCard,
    IonCardContent,
    IonToast,
    useIonActionSheet,
    IonButton,
} from '@ionic/react';
import { personOutline } from 'ionicons/icons';
import groupIcon from '../components/icons/group.svg';
import receiptIcon from '../components/icons/receipt.svg';
import addIcon from '../components/icons/add.svg';
import { GroupService, Group } from '../services/GroupService';
import { ExpenseService, Expense } from '../services/ExpenseService';

import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

import AddExpenseModal from '../components/AddExpenseModal';

export interface MemberInfo {
    uid: string;
    name: string;
    email: string;
    avatar: string;
}

const GroupPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const { user } = useAuth();
    const history = useHistory();
    const [presentActionSheet] = useIonActionSheet();
    const [group, setGroup] = useState<Group | undefined>(GroupService.getById(groupId));
    const [segment, setSegment] = useState<'overview' | 'expense' | 'members'>('overview');
    const [members, setMembers] = useState<MemberInfo[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [toastMessage, setToastMessage] = useState('');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    // Listen for group updates
    useEffect(() => {
        const unsubscribe = GroupService.subscribe(() => {
            const updated = GroupService.getById(groupId);
            setGroup(updated);
            // If group was deleted (e.g. after leaving), navigate back
            if (!updated) {
                history.replace('/money/groups');
            }
        });
        return unsubscribe;
    }, [groupId]);

    // Listen for expense updates
    useEffect(() => {
        ExpenseService.listen(groupId);
        setExpenses(ExpenseService.getAll());
        const unsubscribe = ExpenseService.subscribe(() => {
            setExpenses(ExpenseService.getAll());
        });
        return () => {
            unsubscribe();
            ExpenseService.stopListening();
        };
    }, [groupId]);

    // Fetch member details from Firestore users collection
    useEffect(() => {
        if (!group) return;

        const fetchMembers = async () => {
            const memberInfos: MemberInfo[] = [];
            for (const uid of group.members) {
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
    }, [group?.members?.length]);

    /** Resolve member uids to display names */
    const getMemberNames = (splits: Record<string, any>): string => {
        const uids = Object.keys(splits);
        return uids
            .map((uid) => members.find((m) => m.uid === uid)?.name || 'Unknown')
            .join(', ');
    };

    /**
     * Compute balance for each other member relative to the current user.
     * For member X:
     *   theyOweMe = sum of X's unsettled split amounts in expenses created by current user
     *   iOweThem  = sum of my unsettled split amounts in expenses created by X
     *   balance   = theyOweMe - iOweThem
     *   positive → they owe me (green), negative → I owe them (red)
     */
    const memberBalances = useMemo(() => {
        if (!user) return {};
        const balances: Record<string, number> = {};

        const otherMembers = members.filter((m) => m.uid !== user.uid);
        for (const member of otherMembers) {
            let theyOweMe = 0;
            let iOweThem = 0;

            for (const expense of expenses) {
                // Expenses I created where this member has an unsettled split
                if (expense.createdBy === user.uid) {
                    const split = expense.splits[member.uid];
                    if (split && !split.settled) {
                        theyOweMe += split.amount;
                    }
                }
                // Expenses this member created where I have an unsettled split
                if (expense.createdBy === member.uid) {
                    const split = expense.splits[user.uid];
                    if (split && !split.settled) {
                        iOweThem += split.amount;
                    }
                }
            }

            balances[member.uid] = parseFloat((theyOweMe - iOweThem).toFixed(2));
        }

        return balances;
    }, [expenses, members, user]);

    const handleHeaderClick = () => {
        if (!group || !user) return;

        const isAuthor = group.author === user.uid;

        const buttons: any[] = [
            {
                text: 'Copy Group ID',
                handler: async () => {
                    try {
                        await navigator.clipboard.writeText(groupId);
                        setToastMessage('Group ID copied to clipboard!');
                    } catch {
                        setToastMessage('Failed to copy Group ID.');
                    }
                },
            },
            {
                text: 'Leave Group',
                role: 'destructive',
                handler: async () => {
                    try {
                        await GroupService.leaveGroup(groupId, user.uid);
                        setToastMessage('You left the group.');
                    } catch (err: any) {
                        setToastMessage(err?.message || 'Failed to leave group.');
                    }
                },
            },
        ];

        if (isAuthor) {
            buttons.push({
                text: 'Delete Group',
                role: 'destructive',
                handler: async () => {
                    try {
                        await GroupService.delete(groupId);
                        setToastMessage('Group deleted.');
                    } catch (err: any) {
                        setToastMessage(err?.message || 'Failed to delete group.');
                    }
                },
            });
        }

        buttons.push({ text: 'Cancel', role: 'cancel' });

        presentActionSheet({ buttons });
    };

    if (!group) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/money/groups" />
                        </IonButtons>
                        <IonTitle>Group</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding ion-text-center">
                    <p>Group not found.</p>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/money/groups" />
                    </IonButtons>
                    <IonTitle>{group.name}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {/* Group header card - clickable */}
                <IonCard button onClick={handleHeaderClick}>
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
                                fontSize: '28px',
                            }}>
                                <IonIcon icon={groupIcon} style={{ fontSize: '28px' }} />
                            </IonAvatar>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--ion-text-color)' }}>{group.name}</h2>
                                <p style={{
                                    margin: 0,
                                    fontSize: '12px',
                                    color: 'var(--ion-color-medium)',
                                    fontFamily: 'monospace',
                                    wordBreak: 'break-all',
                                }}>
                                    {group.id}
                                </p>
                            </div>
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Segment toggle */}
                <div className="ion-padding-horizontal">
                    <IonSegment
                        value={segment}
                        onIonChange={(e) => setSegment(e.detail.value as 'overview' | 'expense' | 'members')}
                    >
                        <IonSegmentButton value="overview">
                            <IonLabel>Overview</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="expense">
                            <IonLabel>Expenses ({expenses.length})</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="members">
                            <IonLabel>Members ({group.members.length})</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </div>

                {/* Overview segment */}
                {segment === 'overview' && (
                    <IonCard>
                        {members.filter((m) => m.uid !== user?.uid).length === 0 ? (
                            <IonCardContent className="ion-text-center ion-padding">
                                <p>No other members in this group.</p>
                            </IonCardContent>
                        ) : (
                            <IonList>
                                {members
                                    .filter((m) => m.uid !== user?.uid)
                                    .map((member) => {
                                        const balance = memberBalances[member.uid] ?? 0;
                                        const isPositive = balance > 0;
                                        const isNegative = balance < 0;
                                        return (
                                            <IonItem key={member.uid} button routerLink={`/money/groups/${groupId}/balance/${member.uid}`}>
                                                <IonAvatar slot="start">
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
                                                <IonLabel>
                                                    <h3>{member.name}</h3>
                                                    <p>
                                                        {isPositive && 'owes you'}
                                                        {isNegative && 'you owe'}
                                                        {!isPositive && !isNegative && 'settled up'}
                                                    </p>
                                                </IonLabel>
                                                <IonLabel
                                                    slot="end"
                                                    color={isPositive ? 'success' : isNegative ? 'danger' : 'medium'}
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    {balance === 0 ? '₹0' : `₹${Math.abs(balance).toLocaleString()}`}
                                                </IonLabel>
                                            </IonItem>
                                        );
                                    })}
                            </IonList>
                        )}
                    </IonCard>
                )}

                {/* Expenses segment */}
                {segment === 'expense' && (
                    <IonCard>
                        {expenses.length === 0 ? (
                            <IonCardContent className="ion-text-center ion-padding">
                                <p>No expenses in this group yet.</p>
                            </IonCardContent>
                        ) : (
                            <IonList>
                                {expenses.map((expense) => (
                                    <IonItem key={expense.id} button routerLink={`/money/groups/${groupId}/expenses/${expense.id}`}>
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
                                            <p>{getMemberNames(expense.splits)}</p>
                                        </IonLabel>
                                        <IonLabel slot="end">
                                            ₹{expense.totalAmount.toLocaleString()}
                                        </IonLabel>
                                    </IonItem>
                                ))}
                            </IonList>
                        )}
                    </IonCard>
                )}

                {/* Members segment */}
                {segment === 'members' && (
                    <IonCard>
                        {members.length === 0 ? (
                            <IonCardContent className="ion-text-center ion-padding">
                                <p>No members found.</p>
                            </IonCardContent>
                        ) : (
                            <IonList>
                                {members.map((member) => (
                                    <IonItem key={member.uid}>
                                        <IonAvatar slot="start">
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
                                        <IonLabel>
                                            <h3>{member.name}</h3>
                                            <p>{member.email}</p>
                                        </IonLabel>
                                    </IonItem>
                                ))}
                            </IonList>
                        )}
                    </IonCard>
                )}

                <div style={{
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 1000,
                }}>
                    <IonButton shape="round" onClick={() => setIsExpenseModalOpen(true)}>
                        <IonIcon slot="start" icon={addIcon} />
                        Add Expense
                    </IonButton>
                </div>
            </IonContent>

            <AddExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                members={members}
                groupId={groupId}
                onAdd={() => setToastMessage('Expense added!')}
            />

            <IonToast
                isOpen={!!toastMessage}
                message={toastMessage}
                duration={2000}
                onDidDismiss={() => setToastMessage('')}
            />
        </IonPage>
    );
};

export default GroupPage;
