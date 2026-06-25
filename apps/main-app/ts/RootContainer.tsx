import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PureComponent } from "react";
import {
  AccessibilityInfo,
  AppState,
  AppStateStatus,
  EmitterSubscription,
  NativeEventSubscription,
  StatusBar
} from "react-native";
import SplashScreen from "react-native-splash-screen";
import { connect } from "react-redux";

import DebugInfoOverlay from "./components/debug/DebugInfoOverlay";
import PagoPATestIndicatorOverlay from "./components/PagoPATestIndicatorOverlay";
import { LightModalRoot } from "./components/ui/LightModal";
import {
  configurePushNotificationListeners,
  setupAndroidNotificationChannel
} from "./features/pushNotifications/utils/configurePushNotification";
import { useAppThemeConfiguration } from "./hooks/useAppThemeConfiguration";
import { setLocale } from "./i18n";
import { IONavigationContainer } from "./navigation/AppStackNavigator";
import RootModal from "./screens/modal/RootModal";
import { applicationChangeState } from "./store/actions/application";
import { setDebugCurrentRouteName } from "./store/actions/debug";
import { navigateBack } from "./store/actions/navigation";
import { setScreenReaderEnabled } from "./store/actions/preferences";
import { Store } from "./store/actions/types";
import { isDebugModeEnabledSelector } from "./store/reducers/debug";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "./store/reducers/persistedPreferences";
import { GlobalState } from "./store/reducers/types";

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & { store: Store };

/**
 * The main container of the application with:
 * - the Navigator
 * - the IdentificationModal, for authenticating user after login by CIE/SPID
 * - the SystemOffModal, shown if backend is unavailable
 * - the UpdateAppModal, if the backend is not compatible with the installed app version
 * - the root for displaying light modals
 */
class RootContainer extends PureComponent<Props> {
  private accessibilitySubscription: EmitterSubscription | undefined;
  private clearNotificationHandlers: () => void;
  private subscription: NativeEventSubscription | undefined;

  constructor(props: Props) {
    super(props);
    void setupAndroidNotificationChannel();
    this.clearNotificationHandlers = configurePushNotificationListeners(
      props.store
    );
  }

  public componentDidMount() {
    // boot: send the status of the application
    this.handleApplicationActivity(AppState.currentState);
    // eslint-disable-next-line functional/immutable-data
    this.subscription = AppState.addEventListener(
      "change",
      this.handleApplicationActivity
    );
    // eslint-disable-next-line functional/immutable-data
    this.accessibilitySubscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      this.handleScreenReaderEnabled
    );
    AccessibilityInfo.isScreenReaderEnabled()
      .then(this.handleScreenReaderEnabled)
      .catch(() => undefined);

    this.updateLocale();
    // Hide splash screen
    SplashScreen.hide();
  }

  public componentDidUpdate() {
    this.updateLocale();
  }

  public componentWillUnmount() {
    this.subscription?.remove();
    this.accessibilitySubscription?.remove();
    this.clearNotificationHandlers();
  }

  public render() {
    // FIXME: perhaps instead of navigating to a "background"
    //        screen, we can make this screen blue based on
    //        the redux state (i.e. background)

    // if we have no information about the backend, don't force the update

    return (
      <>
        <StatusBar
          backgroundColor={"transparent"}
          barStyle={"dark-content"}
          translucent
        />
        <IONavigationContainer />

        {/* When debug mode is enabled, the following information
        is displayed:
         - App version, e.g: v.2.x
         - Route name (as constant), e.g: MESSAGES_INBOX
         - pagoPA test indicator
         */}
        {this.props.isDebugModeEnabled && <DebugInfoOverlay />}
        {/* When debug mode is disabled, only the pagoPA
        test indicator is displayed. It's the same component,
        but not grouped with other indicators. */}
        {this.props.isPagoPATestEnabled && !this.props.isDebugModeEnabled && (
          <PagoPATestIndicatorOverlay />
        )}

        <RootModal />
        <LightModalRoot />
      </>
    );
  }

  private handleApplicationActivity = (activity: AppStateStatus) =>
    this.props.applicationChangeState(activity);

  private handleScreenReaderEnabled = (isScreenReaderEnabled: boolean) =>
    this.props.setScreenReaderEnabled({
      screenReaderEnabled: isScreenReaderEnabled
    });

  /**
   * If preferred language is set in the Persisted Store it sets the app global Locale
   * otherwise it continues using the default locale set from the SO
   */
  private updateLocale = () =>
    pipe(
      this.props.preferredLanguage,
      O.map(l => {
        setLocale(l);
      })
    );
}

const mapStateToProps = (state: GlobalState) => ({
  preferredLanguage: preferredLanguageSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  isDebugModeEnabled: isDebugModeEnabledSelector(state)
});

const mapDispatchToProps = {
  applicationChangeState,
  navigateBack,
  setDebugCurrentRouteName,
  setScreenReaderEnabled
};

const RootContainerClass = connect(
  mapStateToProps,
  mapDispatchToProps
)(RootContainer);

const RootContainerFC = ({ store }: { store: Store }) => {
  useAppThemeConfiguration();

  return <RootContainerClass store={store} />;
};

export default RootContainerFC;
