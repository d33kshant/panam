import { Redirect, Route, useLocation } from 'react-router-dom';
import {
    IonApp,
    IonAvatar,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonSpinner,
    IonTabBar,
    IonTabButton,
    IonTabs,
    setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import homeIcon from './components/icons/home.svg';
import rupeeIcon from './components/icons/rupee.svg';
import youIcon from './components/icons/you.svg';
import Home from './pages/Home';
import Money from './pages/Money';
import You from './pages/You';
import Auth from './pages/Auth';
import CategoriesPage from './pages/CategoriesPage';
import TransactionsPage from './pages/TransactionsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
import '@ionic/react/css/palettes/dark.class.css';
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

import { ThemeService } from './services/ThemeService';

setupIonicReact();
ThemeService.init();

const TOP_LEVEL_ROUTES = ['/home', '/money', '/you'];

const AppTabs: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const showTabBar = TOP_LEVEL_ROUTES.includes(location.pathname);

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/home">
                    <Home />
                </Route>
                <Route exact path="/money/transactions">
                    <TransactionsPage />
                </Route>
                <Route exact path="/money">
                    <Money />
                </Route>
                <Route exact path="/you/categories">
                    <CategoriesPage />
                </Route>
                <Route exact path="/you">
                    <You />
                </Route>
                <Route exact path="/">
                    <Redirect to="/home" />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom" style={showTabBar ? undefined : { display: 'none' }}>
                <IonTabButton tab="home" href="/home">
                    <IonIcon aria-hidden="true" icon={homeIcon} />
                    <IonLabel>Home</IonLabel>
                </IonTabButton>
                <IonTabButton tab="money" href="/money">
                    <IonIcon aria-hidden="true" icon={rupeeIcon} />
                    <IonLabel>Money</IonLabel>
                </IonTabButton>
                <IonTabButton tab="you" href="/you">
                    {user?.photoURL ? (
                        <IonAvatar style={{ width: "20px", height: "20px", marginBottom: "4px" }}>
                            <img src={user.photoURL} alt="avatar" />
                        </IonAvatar>
                    ) : (
                        <IonIcon aria-hidden="true" icon={youIcon} />
                    )}
                    <IonLabel>You</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

const AuthGuard: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <IonApp>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <IonSpinner />
                </div>
            </IonApp>
        );
    }

    return (
        <IonApp>
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route exact path="/auth">
                        {user ? <Redirect to="/home" /> : <Auth />}
                    </Route>
                    <Route>
                        {user ? <AppTabs /> : <Redirect to="/auth" />}
                    </Route>
                </IonRouterOutlet>
            </IonReactRouter>
        </IonApp>
    );
};

const App: React.FC = () => (
    <AuthProvider>
        <AuthGuard />
    </AuthProvider>
);

export default App;
