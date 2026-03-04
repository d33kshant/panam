import { useState, useEffect } from 'react';
import {
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonBadge,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import notificationsIcon from '../components/icons/notifications.svg';
import WeekChart from '../components/WeekChart';
import MonthChart from '../components/MonthChart';
import BudgetOverview from '../components/BudgetOverview';
import { NotificationService } from '../services/NotificationService';

const cardStyle: React.CSSProperties = { margin: 0, height: '100%' };

const Home: React.FC = () => {
    const history = useHistory();
    const [unseenCount, setUnseenCount] = useState(NotificationService.getUnseenCount());

    useEffect(() => {
        setUnseenCount(NotificationService.getUnseenCount());
        const unsubscribe = NotificationService.subscribe(() => {
            setUnseenCount(NotificationService.getUnseenCount());
        });
        return unsubscribe;
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Home</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => history.push('/notifications')}>
                            <IonIcon slot="icon-only" icon={notificationsIcon} />
                            {unseenCount > 0 && (
                                <IonBadge
                                    color="danger"
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '2px',
                                        fontSize: '10px',
                                        minWidth: '16px',
                                        height: '16px',
                                        borderRadius: '8px',
                                        padding: '0 4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {unseenCount > 9 ? '9+' : unseenCount}
                                </IonBadge>
                            )}
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Home</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonGrid style={{ padding: '5px' }}>
                    <IonRow>
                        <IonCol size="12" style={{ padding: '5px' }}>
                            <WeekChart style={cardStyle} />
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol size="12" sizeMd="6" style={{ padding: '5px' }}>
                            <MonthChart style={cardStyle} />
                        </IonCol>
                        <IonCol size="12" sizeMd="6" style={{ padding: '5px' }}>
                            <BudgetOverview style={cardStyle} />

                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default Home;
