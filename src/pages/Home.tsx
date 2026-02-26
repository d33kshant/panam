import { IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import WeekChart from '../components/WeekChart';
import MonthChart from '../components/MonthChart';
import BudgetOverview from '../components/BudgetOverview';

const cardStyle: React.CSSProperties = { margin: 0, height: '100%' };

const Home: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Home</IonTitle>
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
