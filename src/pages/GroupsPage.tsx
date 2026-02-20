import { useState, useEffect, useMemo } from 'react';
import {
    IonContent,
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
    IonButton,
    IonAlert,
    IonToast,
} from '@ionic/react';
import addIcon from '../components/icons/add.svg';
import joinIcon from '../components/icons/join.svg';
import { useHistory } from 'react-router-dom';
import groupIcon from '../components/icons/group.svg';
import { Group, GroupService } from '../services/GroupService';
import { useAuth } from '../contexts/AuthContext';

const GroupsPage: React.FC = () => {
    const { user } = useAuth();
    const history = useHistory();
    const [groups, setGroups] = useState<Group[]>(GroupService.getAll());
    const [searchText, setSearchText] = useState('');
    const [showCreateAlert, setShowCreateAlert] = useState(false);
    const [showJoinAlert, setShowJoinAlert] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

    useEffect(() => {
        const unsubscribe = GroupService.subscribe(() => {
            setGroups(GroupService.getAll());
        });
        return unsubscribe;
    }, []);

    const filteredGroups = useMemo(() => {
        if (!searchText.trim()) return groups;
        const query = searchText.toLowerCase().trim();
        return groups.filter((g) =>
            g.name.toLowerCase().includes(query)
        );
    }, [groups, searchText]);

    const handleCreateGroup = async (name: string) => {
        if (!name.trim() || !user) return;
        try {
            await GroupService.create({
                name: name.trim(),
                members: [user.uid],
                author: user.uid,
            });
            setToastColor('success');
            setToastMessage('Group created successfully!');
        } catch (err: any) {
            setToastColor('danger');
            setToastMessage(err?.message || 'Failed to create group.');
        }
    };

    const handleJoinGroup = async (groupId: string) => {
        if (!groupId.trim() || !user) return;
        try {
            await GroupService.joinGroup(groupId.trim(), user.uid);
            setToastColor('success');
            setToastMessage('Joined group successfully!');
        } catch (err: any) {
            setToastColor('danger');
            setToastMessage(err?.message || 'Failed to join group.');
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/money" />
                    </IonButtons>
                    <IonTitle>Groups</IonTitle>
                </IonToolbar>
                <IonToolbar>
                    <IonSearchbar
                        value={searchText}
                        onIonInput={(e) => setSearchText(e.detail.value ?? '')}
                        placeholder="Search by group name"
                        debounce={250}
                    />
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonCard>
                    {filteredGroups.length === 0 ? (
                        <IonCardContent className="ion-text-center ion-padding">
                            <p>No groups found matching your query.</p>
                        </IonCardContent>
                    ) : (
                        <IonList>
                            {filteredGroups.map((group) => (
                                <IonItem
                                    key={group.id}
                                    button
                                    detail
                                    onClick={() => history.push(`/money/groups/${group.id}`)}
                                >
                                    <IonAvatar slot="start" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'var(--ion-background-color-step-200)',
                                    }}>
                                        <IonIcon icon={groupIcon} />
                                    </IonAvatar>
                                    <IonLabel>
                                        <h3>{group.name}</h3>
                                        <p>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
                                    </IonLabel>
                                </IonItem>
                            ))}
                        </IonList>
                    )}
                </IonCard>

                <div style={{
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 1000,
                }}>
                    <IonButton shape="round" onClick={() => setShowCreateAlert(true)}>
                        <IonIcon slot="start" icon={addIcon} />
                        Create a Group
                    </IonButton>
                    <IonButton shape="round" onClick={() => setShowJoinAlert(true)}>
                        <IonIcon slot="start" icon={joinIcon} />
                        Join a Group
                    </IonButton>
                </div>
            </IonContent>

            <IonAlert
                isOpen={showCreateAlert}
                onDidDismiss={() => setShowCreateAlert(false)}
                header="Create Group"
                message="Give the group a name"
                inputs={[
                    {
                        name: 'groupName',
                        type: 'text',
                        placeholder: 'Group name',
                    },
                ]}
                buttons={[
                    { text: 'Cancel', role: 'cancel' },
                    {
                        text: 'Create',
                        handler: (data) => {
                            handleCreateGroup(data.groupName);
                        },
                    },
                ]}
            />

            <IonAlert
                isOpen={showJoinAlert}
                onDidDismiss={() => setShowJoinAlert(false)}
                header="Join a Group"
                message="Enter the Group ID to join."
                inputs={[
                    {
                        name: 'groupId',
                        type: 'text',
                        placeholder: 'Group ID',
                    },
                ]}
                buttons={[
                    { text: 'Cancel', role: 'cancel' },
                    {
                        text: 'Join',
                        handler: (data) => {
                            handleJoinGroup(data.groupId);
                        },
                    },
                ]}
            />

            <IonToast
                isOpen={!!toastMessage}
                message={toastMessage}
                duration={3000}
                color={toastColor}
                onDidDismiss={() => setToastMessage('')}
            />
        </IonPage>
    );
};

export default GroupsPage;
