import { useState } from 'react';
import { IonButton, IonContent, IonPage, IonIcon, IonToast } from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';
import { AuthService } from '../services/AuthService';

const Auth: React.FC = () => {
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        try {
            await AuthService.signInWithGoogle();
        } catch (err: any) {
            const message = err?.message || 'Google sign-in failed';
            console.error('Google sign-in failed:', err);
            setError(message);
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding ion-text-center">
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <IonButton onClick={handleGoogleSignIn}>
                        <IonIcon slot="start" icon={logoGoogle} />
                        Continue with Google
                    </IonButton>
                </div>
                <IonToast
                    isOpen={!!error}
                    message={error}
                    duration={5000}
                    color="danger"
                    onDidDismiss={() => setError('')}
                />
            </IonContent>
        </IonPage>
    );
};

export default Auth;

