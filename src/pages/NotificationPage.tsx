import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonLabel,
    IonList,
    IonItem,
    IonAvatar,
    IonCard,
    IonCardContent,
    IonToast,
} from '@ionic/react';
import doneIcon from '../components/icons/done.svg';
import notificationsIcon from '../components/icons/notifications.svg';
import { NotificationService, Notification } from '../services/NotificationService';

const NotificationPage: React.FC = () => {
    const history = useHistory();
    const [notifications, setNotifications] = useState<Notification[]>(NotificationService.getAll());
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        setNotifications(NotificationService.getAll());
        const unsubscribe = NotificationService.subscribe(() => {
            setNotifications(NotificationService.getAll());
        });
        return unsubscribe;
    }, []);

    const handleMarkAllSeen = async () => {
        try {
            await NotificationService.markAllAsSeen();
            setToastMessage('All notifications marked as seen.');
        } catch (err: any) {
            setToastMessage(err?.message || 'Failed to mark notifications.');
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        const { action } = notification;
        if (action.startsWith('exp:')) {
            // Format: exp:groupId:expenseId
            const parts = action.split(':');
            if (parts.length === 3) {
                history.push(`/money/groups/${parts[1]}/expenses/${parts[2]}`);
            }
        } else if (action.startsWith('grp:')) {
            // Format: grp:groupId
            const groupId = action.substring(4);
            history.push(`/money/groups/${groupId}`);
        }
    };

    const formatTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const unseenCount = notifications.filter((n) => !n.seen).length;

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>Notifications</IonTitle>
                    {unseenCount > 0 && (
                        <IonButtons slot="end">
                            <IonButton onClick={handleMarkAllSeen}>
                                <IonIcon slot="icon-only" icon={doneIcon} />
                            </IonButton>
                        </IonButtons>
                    )}
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {notifications.length === 0 ? (
                    <IonCard>
                        <IonCardContent className="ion-text-center ion-padding">
                            <p>No notifications.</p>
                        </IonCardContent>
                    </IonCard>
                ) : (
                    <IonCard>
                        <IonList>
                            {notifications.map((notification) => (
                                <IonItem
                                    key={notification.id}
                                    button
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        '--background': !notification.seen
                                            ? 'var(--ion-background-color-step-50, rgba(var(--ion-color-primary-rgb), 0.05))'
                                            : undefined,
                                    }}
                                >
                                    <IonAvatar slot="start" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'var(--ion-background-color-step-200)',
                                    }}>
                                        <IonIcon
                                            icon={notificationsIcon}
                                            color={!notification.seen ? 'primary' : 'medium'}
                                        />
                                    </IonAvatar>
                                    <IonLabel>
                                        <h3 style={{
                                            fontWeight: !notification.seen ? 600 : 400,
                                        }}>
                                            {notification.message}
                                        </h3>
                                        <p>{formatTime(notification.createdAt)}</p>
                                    </IonLabel>
                                    {!notification.seen && (
                                        <div
                                            slot="end"
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--ion-color-primary)',
                                            }}
                                        />
                                    )}
                                </IonItem>
                            ))}
                        </IonList>
                    </IonCard>
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

export default NotificationPage;
