import { Root } from "native-base";
import * as React from "react";
import {
  AppState,
  BackHandler,
  Linking,
  Platform,
  StatusBar
} from "react-native";
import { connect } from "react-redux";

import { initialiseInstabug } from "./boot/configureInstabug";
import configurePushNotifications from "./boot/configurePushNotification";
import FlagSecureComponent from "./components/FlagSecure";
import { LightModalRoot } from "./components/ui/LightModal";
import VersionInfoOverlay from "./components/VersionInfoOverlay";
import { shouldDisplayVersionInfoOverlay } from "./config";
import IdentificationModal from "./IdentificationModal";
import Navigation from "./navigation";
import {
  applicationChangeState,
  ApplicationState
} from "./store/actions/application";
import { navigateToDeepLink, setDeepLink } from "./store/actions/deepLink";
import { navigateBack } from "./store/actions/navigation";
import { GlobalState } from "./store/reducers/types";
import { getNavigateActionFromDeepLink } from "./utils/deepLink";

// tslint:disable-next-line:no-use-before-declare
type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

/**
 * The main container of the application with the ConnectionBar and the Navigator
 */
class RootContainer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);

    /* Configure the application to receive push notifications */
    configurePushNotifications();
  }

  private handleBackButton = () => {
    if (this.props.navigation.index === 0) {
      BackHandler.exitApp();
      return false;
    }
    this.props.navigateBack();
    return true;
  };

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

  public componentWillMount() {
    initialiseInstabug();
  }

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    if (Platform.OS === "android") {
      Linking.getInitialURL()
        .then(this.navigateToUrlHandler)
        .catch(console.error); // tslint:disable-line:no-console
    } else {
      Linking.addEventListener("url", this.handleOpenUrlEvent);
    }

    AppState.addEventListener("change", this.handleApplicationActivity);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

    if (Platform.OS === "ios") {
      Linking.removeEventListener("url", this.handleOpenUrlEvent);
    }

    AppState.removeEventListener("change", this.handleApplicationActivity);
  }

  // public shouldComponentUpdate(_: Props): boolean {
  //   return false;
  // }

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
  }

  public render() {
    // FIXME: perhaps instead of navigating to a "background"
    //        screen, we can make this screen blue based on
    //        the redux state (i.e. background)
    return (
      <Root>
        <StatusBar barStyle="dark-content" />
        {Platform.OS === "android" && (
          <FlagSecureComponent
            isFlagSecureEnabled={!this.props.isDebugModeEnabled}
          />
        )}
        {shouldDisplayVersionInfoOverlay && <VersionInfoOverlay />}
        <Navigation />
        <IdentificationModal />
        <LightModalRoot />
      </Root>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  deepLinkState: state.deepLink,
  isDebugModeEnabled: state.debug.isDebugModeEnabled,
  navigation: state.nav
});

const mapDispatchToProps = {
  applicationChangeState,
  setDeepLink,
  navigateToDeepLink,
  navigateBack
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RootContainer);
