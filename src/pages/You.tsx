import { useState } from 'react';
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
    useIonActionSheet,
} from '@ionic/react';
import categoriesIcon from '../components/icons/categories.svg';
import themeIcon from '../components/icons/theme.svg';
import { ThemeService, ThemeMode } from '../services/ThemeService';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/AuthService';

const THEME_LABELS: Record<ThemeMode, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
};

const You: React.FC = () => {
    const { user } = useAuth();
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>(ThemeService.get());
    const [presentActionSheet] = useIonActionSheet();

    const handleUserClick = () => {
        presentActionSheet({
            buttons: [
                {
                    text: 'Logout',
                    role: 'destructive',
                    handler: () => {
                        AuthService.signOut();
                    },
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
            ],
        });
    };

    const handleThemeClick = () => {
        presentActionSheet({
            header: 'Select Theme',
            buttons: [
                {
                    text: 'Light',
                    handler: () => {
                        ThemeService.set('light');
                        setCurrentTheme('light');
                    },
                },
                {
                    text: 'Dark',
                    handler: () => {
                        ThemeService.set('dark');
                        setCurrentTheme('dark');
                    },
                },
                {
                    text: 'System',
                    handler: () => {
                        ThemeService.set('system');
                        setCurrentTheme('system');
                    },
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
            ],
        });
    };

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
                    <IonItem button detail lines="none" onClick={handleUserClick}>
                        <IonAvatar slot="start">
                            <img src={user?.photoURL || ''} alt="avatar" />
                        </IonAvatar>
                        <IonLabel>
                            <h2>{user?.displayName || 'User'}</h2>
                            <p>{user?.email || ''}</p>
                        </IonLabel>
                    </IonItem>
                </IonCard>
                <IonCard>
                    <IonListHeader>
                        <IonLabel><h2><strong>Preference</strong></h2></IonLabel>
                    </IonListHeader>
                    <IonList>
                        <IonItem button detail onClick={handleThemeClick}>
                            <IonAvatar
                                slot="start"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'var(--ion-background-color-step-200)',
                                }}
                            >
                                <IonIcon icon={themeIcon} />
                            </IonAvatar>
                            <IonLabel>Theme</IonLabel>
                            <IonLabel slot="end" color="medium">
                                {THEME_LABELS[currentTheme]}
                            </IonLabel>
                        </IonItem>
                    </IonList>
                </IonCard>
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
