import { Root } from "native-base";
import * as React from "react";
import { AppState, Linking, Platform, StatusBar } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { createAppContainer } from "react-navigation";
import { connect } from "react-redux";
import { initialiseInstabug } from "./boot/configureInstabug";
import configurePushNotifications from "./boot/configurePushNotification";
import { BetaTestingOverlay } from "./components/BetaTestingOverlay";
import FlagSecureComponent from "./components/FlagSecure";
import { LightModalRoot } from "./components/ui/LightModal";
import VersionInfoOverlay from "./components/VersionInfoOverlay";
import {
  cgnTestOverlay,
  shouldDisplayVersionInfoOverlay,
  testOverlayCaption
} from "./config";

import { setLocale } from "./i18n";
import AppNavigator from "./navigation/AppNavigator";
import NavigationService from "./navigation/NavigationService";
import RootModal from "./screens/modal/RootModal";
import {
  applicationChangeState,
  ApplicationState
} from "./store/actions/application";
import { setDebugCurrentRouteName } from "./store/actions/debug";
import { navigateToDeepLink, setDeepLink } from "./store/actions/deepLink";
import { navigateBack } from "./store/actions/navigation";
import { trackScreen } from "./store/middlewares/navigation";
import { preferredLanguageSelector } from "./store/reducers/persistedPreferences";
import { GlobalState } from "./store/reducers/types";
import { getNavigateActionFromDeepLink } from "./utils/deepLink";
import { getCurrentRouteName } from "./utils/navigation";
import { isStringNullyOrEmpty } from "./utils/strings";

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AppContainer = createAppContainer(AppNavigator);

/**
 * The main container of the application with:
 * - the Navigator
 * - the IdentificationModal, for authenticating user after login by CIE/SPID
 * - the SystemOffModal, shown if backend is unavailable
 * - the UpdateAppModal, if the backend is not compatible with the installed app version
 * - the root for displaying light modals
 */
class RootContainer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);

    /* Configure the application to receive push notifications */
    configurePushNotifications();
  }

  private handleOpenUrlEvent = (event: { url: string }): void =>
    this.navigateToUrlHandler(event.url);

  private handleApplicationActivity = (activity: ApplicationState) =>
    this.props.applicationChangeState(activity);

  private navigateToUrlHandler = (url: string | null) => {
    if (!url) {
      return;
    }
    const action = getNavigateActionFromDeepLink(url);
    // immediately navigate to the resolved action
    this.props.setDeepLink(action, true);
  };

  public componentDidMount() {
    initialiseInstabug();

    if (Platform.OS === "android") {
      Linking.getInitialURL()
        .then(this.navigateToUrlHandler)
        .catch(console.error); // eslint-disable-line no-console
    } else {
      Linking.addEventListener("url", this.handleOpenUrlEvent);
    }
    // boot: send the status of the application
    this.handleApplicationActivity(AppState.currentState);
    AppState.addEventListener("change", this.handleApplicationActivity);

    this.updateLocale();
    // Hide splash screen
    SplashScreen.hide();
  }

  /**
   * If preferred language is set in the Persisted Store it sets the app global Locale
   * otherwise it continues using the default locale set from the SO
   */
  private updateLocale = () =>
    this.props.preferredLanguage.map(l => {
      setLocale(l);
    });

  public componentWillUnmount() {
    if (Platform.OS === "ios") {
      Linking.removeEventListener("url", this.handleOpenUrlEvent);
    }

    AppState.removeEventListener("change", this.handleApplicationActivity);
  }

  public componentDidUpdate() {
    // FIXME: the logic here is a bit weird: there is an event handler
    //        (navigateToUrlHandler) that will dispatch a redux action for
    //        setting a "deep link" in the redux state - in turn, the update
    //        of the redux state triggers an update of the RootComponent that
    //        dispatches a navigate action from componentDidUpdate - can't we
    //        just listen for SET_DEEPLINK from a saga and dispatch the
    //        navigate action from there?
    // FIXME: how does this logic interacts with the logic that handles the deep
    //        link in the startup saga?
    const {
      deepLinkState: { deepLink, immediate }
    } = this.props;

    if (immediate && deepLink) {
      this.props.navigateToDeepLink(deepLink);
    }
    this.updateLocale();
  }

  public render() {
    // FIXME: perhaps instead of navigating to a "background"
    //        screen, we can make this screen blue based on
    //        the redux state (i.e. background)

    // if we have no information about the backend, don't force the update

    return (
      <Root>
        <StatusBar barStyle={"dark-content"} />
        {Platform.OS === "android" && <FlagSecureComponent />}
        <AppContainer
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
          onNavigationStateChange={(prevState, currentState) => {
            NavigationService.setCurrentState(currentState);
            this.props.setDebugCurrentRouteName(
              getCurrentRouteName(currentState) ?? "Undefined"
            );
            trackScreen(prevState, currentState);
          }}
        />
        {shouldDisplayVersionInfoOverlay && <VersionInfoOverlay />}
        {cgnTestOverlay && (
          <BetaTestingOverlay title="🛠️ CGN TEST VERSION 🛠️" />
        )}
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
  deepLinkState: state.deepLink
});

const mapDispatchToProps = {
  applicationChangeState,
  setDeepLink,
  navigateToDeepLink,
  navigateBack,
  setDebugCurrentRouteName
};

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
