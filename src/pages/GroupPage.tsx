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
import { CategoryService, categoryIcons } from '../services/CategoryService';
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
    const [segment, setSegment] = useState<'expense' | 'members'>('expense');
    const [members, setMembers] = useState<MemberInfo[]>([]);
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

    // Listen for transaction updates - removed because it's no longer linked

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

    // Empty array for now until a separate Expense entity is created
    const groupTransactions: any[] = useMemo(() => {
        return [];
    }, []);

    const getCategoryIcon = (categoryId?: string) => {
        if (!categoryId) return null;
        const category = CategoryService.getById(categoryId);
        if (!category) return null;
        return categoryIcons[category.icon];
    };

    const formatAmount = (amount: number, type: 'income' | 'expense') => {
        const prefix = type === 'income' ? '+ ' : '';
        return `${prefix}₹${amount.toLocaleString()}`;
    };

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
                        onIonChange={(e) => setSegment(e.detail.value as 'expense' | 'members')}
                    >
                        <IonSegmentButton value="expense">
                            <IonLabel>Expenses ({groupTransactions.length})</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="members">
                            <IonLabel>Members ({group.members.length})</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </div>

                {/* Expenses segment */}
                {segment === 'expense' && (
                    <IonCard>
                        {groupTransactions.length === 0 ? (
                            <IonCardContent className="ion-text-center ion-padding">
                                <p>No expenses in this group yet.</p>
                            </IonCardContent>
                        ) : (
                            <IonList>
                                {groupTransactions.map((tx) => {
                                    const catIcon = getCategoryIcon(tx.categoryId);
                                    return (
                                        <IonItem key={tx.id}>
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
                                                {formatAmount(tx.amount, tx.type || 'expense')}
                                            </IonLabel>
                                        </IonItem>
                                    );
                                })}
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
