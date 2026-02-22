import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import WeekChart from '../components/WeekChart';
import MonthChart from '../components/MonthChart';

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
                <WeekChart />
                <MonthChart />
            </IonContent>
        </IonPage>
    );
};

export default Home;
