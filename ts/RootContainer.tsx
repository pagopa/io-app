import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
  Platform,
  StatusBar
} from "react-native";
import SplashScreen from "react-native-splash-screen";
import { connect } from "react-redux";
import configurePushNotifications from "./features/pushNotifications/utils/configurePushNotification";
import DebugInfoOverlay from "./components/DebugInfoOverlay";
import FlagSecureComponent from "./components/FlagSecure";
import PagoPATestIndicatorOverlay from "./components/PagoPATestIndicatorOverlay";
import { LightModalRoot } from "./components/ui/LightModal";
import { setLocale } from "./i18n";
import { IONavigationContainer } from "./navigation/AppStackNavigator";
import RootModal from "./screens/modal/RootModal";
import { applicationChangeState } from "./store/actions/application";
import { setDebugCurrentRouteName } from "./store/actions/debug";
import { navigateBack } from "./store/actions/navigation";
import { isDebugModeEnabledSelector } from "./store/reducers/debug";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "./store/reducers/persistedPreferences";
import { GlobalState } from "./store/reducers/types";
import customVariables from "./theme/variables";
import { ReactNavigationInstrumentation } from "./App";

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    routingInstumentation: ReactNavigationInstrumentation;
  };

/**
 * The main container of the application with:
 * - the Navigator
 * - the IdentificationModal, for authenticating user after login by CIE/SPID
 * - the SystemOffModal, shown if backend is unavailable
 * - the UpdateAppModal, if the backend is not compatible with the installed app version
 * - the root for displaying light modals
 */
class RootContainer extends React.PureComponent<Props> {
  private subscription: NativeEventSubscription | undefined;
  constructor(props: Props) {
    super(props);
    /* Configure the application to receive push notifications */
    configurePushNotifications();
  }

  private handleApplicationActivity = (activity: AppStateStatus) =>
    this.props.applicationChangeState(activity);

  public componentDidMount() {
    // boot: send the status of the application
    this.handleApplicationActivity(AppState.currentState);
    // eslint-disable-next-line functional/immutable-data
    this.subscription = AppState.addEventListener(
      "change",
      this.handleApplicationActivity
    );

    this.updateLocale();
    // Hide splash screen
    SplashScreen.hide();
  }

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

  public componentWillUnmount() {
    this.subscription?.remove();
  }

  public componentDidUpdate() {
    this.updateLocale();
  }

  public render() {
    // FIXME: perhaps instead of navigating to a "background"
    //        screen, we can make this screen blue based on
    //        the redux state (i.e. background)

    // if we have no information about the backend, don't force the update

    return (
      <>
        <StatusBar
          barStyle={"dark-content"}
          backgroundColor={customVariables.androidStatusBarColor}
        />
        {Platform.OS === "android" && <FlagSecureComponent />}

        <IONavigationContainer
          routingInstrumentation={this.props.routingInstumentation}
        />

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
}

const mapStateToProps = (state: GlobalState) => ({
  preferredLanguage: preferredLanguageSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  isDebugModeEnabled: isDebugModeEnabledSelector(state)
});

const mapDispatchToProps = {
  applicationChangeState,
  navigateBack,
  setDebugCurrentRouteName
};

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
