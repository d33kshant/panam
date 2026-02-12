import { IonContent, IonHeader, IonLabel, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const You: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>You</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">You</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonLabel>You</IonLabel>
            </IonContent>
        </IonPage>
    );
};

export default You;
