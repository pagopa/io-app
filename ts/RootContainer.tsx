import { Root } from "native-base";
import * as React from "react";
import { AppState, Linking, Platform, StatusBar } from "react-native";
import { connect } from "react-redux";

import ConnectionBar from "./components/ConnectionBar";
import VersionInfoOverlay from "./components/VersionInfoOverlay";
import Navigation from "./navigation";
import { applicationChangeState } from "./store/actions/application";
import { navigateIfLoggedIn } from "./store/actions/deferredNavigation";
import { ApplicationState } from "./store/actions/types";
import { getNavigateActionFromDeepLink } from "./utils/deepLink";

type DispatchProps = {
  applicationChangeState: typeof applicationChangeState;
  navigateIfLoggedIn: typeof navigateIfLoggedIn;
};

type Props = DispatchProps;

/**
 * The main container of the application with the ConnectionBar and the Navigator
 */
class RootContainer extends React.PureComponent<Props> {
  private handleOpenUrlEvent = (event: { url: string }): void =>
    this.navigateToUrlHandler(event.url);

  private handleApplicationActivity = (activity: ApplicationState) =>
    this.props.applicationChangeState(activity);

  private navigateToUrlHandler = (url: string | null) => {
    if (!url) {
      return;
    }

    this.props.navigateIfLoggedIn(getNavigateActionFromDeepLink(url));
  };

  public componentDidMount() {
    if (Platform.OS === "android") {
      // If the application is summoned from a deep link intent.
      Linking.getInitialURL()
        .then(this.navigateToUrlHandler)
        .catch(console.error); // tslint:disable-line:no-console
    }

    Linking.addEventListener("url", this.handleOpenUrlEvent);
    AppState.addEventListener("change", this.handleApplicationActivity);
  }

  public componentWillUnmount() {
    Linking.removeEventListener("url", this.handleOpenUrlEvent);
    AppState.removeEventListener("change", this.handleApplicationActivity);
  }

  public render() {
    // FIXME: perhaps instead of navigating to a "background"
    //        screen, we can make this screen blue based on
    //        the redux state (i.e. background)
    return (
      <Root>
        <StatusBar barStyle="dark-content" />
        <ConnectionBar />
        <VersionInfoOverlay />
        <Navigation />
      </Root>
    );
  }
}

const mapDispatchToProps = {
  applicationChangeState,
  navigateIfLoggedIn
};

export default connect(
  undefined,
  mapDispatchToProps
)(RootContainer);
