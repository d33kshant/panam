import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
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
import CategoriesPage from './pages/CategoriesPage';
import TransactionsPage from './pages/TransactionsPage';

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
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
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
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon aria-hidden="true" icon={homeIcon} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="money" href="/money">
            <IonIcon aria-hidden="true" icon={rupeeIcon} />
            <IonLabel>Money</IonLabel>
          </IonTabButton>
          <IonTabButton tab="you" href="/you">
            <IonIcon aria-hidden="true" icon={youIcon} />
            <IonLabel>You</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
