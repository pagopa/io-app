import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Root } from "native-base";
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
import configurePushNotifications from "./boot/configurePushNotification";
import { BetaTestingOverlay } from "./components/BetaTestingOverlay";
import FlagSecureComponent from "./components/FlagSecure";
import { LightModalRoot } from "./components/ui/LightModal";
import VersionInfoOverlay from "./components/VersionInfoOverlay";
import { testOverlayCaption } from "./config";
import { setLocale } from "./i18n";
import { IONavigationContainer } from "./navigation/AppStackNavigator";
import RootModal from "./screens/modal/RootModal";
import { applicationChangeState } from "./store/actions/application";
import { setDebugCurrentRouteName } from "./store/actions/debug";
import { navigateBack } from "./store/actions/navigation";
import { isDebugModeEnabledSelector } from "./store/reducers/debug";
import { preferredLanguageSelector } from "./store/reducers/persistedPreferences";
import { GlobalState } from "./store/reducers/types";
import customVariables from "./theme/variables";
import { isStringNullyOrEmpty } from "./utils/strings";

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

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
      <Root>
        <StatusBar
          barStyle={"dark-content"}
          backgroundColor={customVariables.androidStatusBarColor}
        />
        {Platform.OS === "android" && <FlagSecureComponent />}

        <IONavigationContainer />

        {this.props.isDebugModeEnabled && <VersionInfoOverlay />}
        {!isStringNullyOrEmpty(testOverlayCaption) && (
          <BetaTestingOverlay
            title={`🛠️ TEST VERSION 🛠️`}
            body={testOverlayCaption}
          />
        )}
        <RootModal />
        <LightModalRoot />
      </Root>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  preferredLanguage: preferredLanguageSelector(state),
  isDebugModeEnabled: isDebugModeEnabledSelector(state)
});

const mapDispatchToProps = {
  applicationChangeState,
  navigateBack,
  setDebugCurrentRouteName
};

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
