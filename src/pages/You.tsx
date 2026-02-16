import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCard,
    IonList,
    IonListHeader,
    IonItem,
    IonAvatar,
    IonLabel,
    IonIcon,
} from '@ionic/react';
import categoriesIcon from '../components/icons/categories.svg';

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
                <IonCard>
                    <IonListHeader>
                        <IonLabel><h2><strong>Manage</strong></h2></IonLabel>
                    </IonListHeader>
                    <IonList>
                        <IonItem button detail routerLink="/you/categories">
                            <IonAvatar
                                slot="start"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--ion-background-color-step-200)',
                                }}
                            >
                                <IonIcon icon={categoriesIcon} />
                            </IonAvatar>
                            <IonLabel>Categories</IonLabel>
                        </IonItem>
                    </IonList>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default You;
