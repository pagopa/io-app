import { createStackNavigator } from "@react-navigation/stack";
import { Root } from "native-base";
import * as React from "react";
import { AppState, Linking, Platform, StatusBar } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { connect } from "react-redux";
import { initialiseInstabug } from "./boot/configureInstabug";
import configurePushNotifications from "./boot/configurePushNotification";
import { BetaTestingOverlay } from "./components/BetaTestingOverlay";
import workunitGenericFailure from "./components/error/WorkunitGenericFailure";
import FlagSecureComponent from "./components/FlagSecure";
import { LightModalRoot } from "./components/ui/LightModal";
import VersionInfoOverlay from "./components/VersionInfoOverlay";
import { testOverlayCaption } from "./config";
import { zendeskSupportNavigator } from "./features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "./features/zendesk/navigation/routes";

import { setLocale } from "./i18n";
import authenticationNavigator from "./navigation/AuthenticationNavigator";
import mainNavigator from "./navigation/MainNavigator";
import onboardingNavigator from "./navigation/OnboardingNavigator";
import { AppParamsList } from "./navigation/params/AppParamsList";
import ROUTES from "./navigation/routes";
import IngressScreen from "./screens/ingress/IngressScreen";
import RootModal from "./screens/modal/RootModal";
import {
  applicationChangeState,
  ApplicationState
} from "./store/actions/application";
import { setDebugCurrentRouteName } from "./store/actions/debug";
import { navigateToDeepLink, setDeepLink } from "./store/actions/deepLink";
import { navigateBack } from "./store/actions/navigation";
import { isDebugModeEnabledSelector } from "./store/reducers/debug";
import { preferredLanguageSelector } from "./store/reducers/persistedPreferences";
import { GlobalState } from "./store/reducers/types";
import customVariables from "./theme/variables";
import { getNavigateActionFromDeepLink } from "./utils/deepLink";
import { isStringNullyOrEmpty } from "./utils/strings";

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Stack = createStackNavigator<AppParamsList>();

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
        <StatusBar
          barStyle={"dark-content"}
          backgroundColor={customVariables.androidStatusBarColor}
        />
        {Platform.OS === "android" && <FlagSecureComponent />}
        {/* <AppStack */}
        {/*  ref={navigatorRef => { */}
        {/*    NavigationService.setTopLevelNavigator(navigatorRef); */}
        {/*  }} */}
        {/*  onNavigationStateChange={(prevState, currentState) => { */}
        {/*    NavigationService.setCurrentState(currentState); */}
        {/*    this.props.setDebugCurrentRouteName( */}
        {/*      getCurrentRouteName(currentState) ?? "Undefined" */}
        {/*    ); */}
        {/*    trackScreen(prevState, currentState); */}
        {/*  }} */}
        {/* /> */}
        <Stack.Navigator initialRouteName={"INGRESS"} headerMode={"none"}>
          <Stack.Screen name={ROUTES.INGRESS} component={IngressScreen} />
          <Stack.Screen
            name={ROUTES.AUTHENTICATION}
            component={authenticationNavigator}
          />
          <Stack.Screen
            name={ROUTES.ONBOARDING}
            component={onboardingNavigator}
          />
          <Stack.Screen name={ROUTES.MAIN} component={mainNavigator} />
          <Stack.Screen
            name={ROUTES.WORKUNIT_GENERIC_FAILURE}
            component={workunitGenericFailure}
          />
          <Stack.Screen
            name={ZENDESK_ROUTES.MAIN}
            component={zendeskSupportNavigator}
          />
        </Stack.Navigator>

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
  deepLinkState: state.deepLink,
  isDebugModeEnabled: isDebugModeEnabledSelector(state)
});

const mapDispatchToProps = {
  applicationChangeState,
  setDeepLink,
  navigateToDeepLink,
  navigateBack,
  setDebugCurrentRouteName
};

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
