import { Root } from "native-base";
import * as React from "react";
import { connect } from "react-redux";

import { AppState, Linking, Platform, StatusBar } from "react-native";
import ConnectionBar from "./components/ConnectionBar";
import VersionInfoOverlay from "./components/VersionInfoOverlay";

import { NavigationNavigateActionPayload } from "react-navigation";
import Navigation from "./navigation";
import ROUTES from "./navigation/routes";
import {
  applicationChangeState,
  ApplicationChangeState
} from "./store/actions/application";
import {
  navigateToDeeplink,
  NavigateToDeeplink,
  setDeeplink,
  SetDeeplink
} from "./store/actions/deeplink";
import { ApplicationState } from "./store/actions/types";
import { GlobalState } from "./store/reducers/types";

type StateProps = {
  appState: string;
};

type DispatchProps = {
  applicationChangeState: (
    activity: ApplicationState
  ) => ApplicationChangeState;
  setDeeplink: (
    navigationPayload: NavigationNavigateActionPayload
  ) => SetDeeplink;
  navigateToDeeplink: (
    navigationPayload: NavigationNavigateActionPayload
  ) => NavigateToDeeplink;
};

type Props = StateProps & DispatchProps;

/**
 * The main container of the application with the ConnectionBar and the Navigator
 */
class RootContainer extends React.Component<Props> {
  public componentDidMount() {
    if (Platform.OS === "android") {
      Linking.getInitialURL()
        .then(this.navigate)
        .catch(console.error);
    } else {
      Linking.addEventListener("url", this.handleOpenURL);
    }

    AppState.addEventListener("change", this.handleApplicationActivityChange);
  }

  public componentWillUnmount() {
    Linking.removeEventListener("url", this.handleOpenURL);
    AppState.removeEventListener(
      "change",
      this.handleApplicationActivityChange
    );
  }

  private handleOpenURL = (event: { url: string }) => {
    this.navigate(event.url);
  };

  private navigate = (url: string | null) => {
    if (!url) {
      return;
    }

    const route = url.slice(ROUTES.PREFIX.length);
    const routeParts = route.split("/");
    const routeName = routeParts[0];
    const id = routeParts[1] || undefined;

    const deeplinkNavigationPayload = { routeName, id };

    if (this.props.appState === "background") {
      this.props.setDeeplink(deeplinkNavigationPayload);
    } else {
      this.props.navigateToDeeplink(deeplinkNavigationPayload);
    }
  };

  public handleApplicationActivityChange = (activity: ApplicationState) => {
    this.props.applicationChangeState(activity);
  };

  public render() {
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

const mapStateToProps = (state: GlobalState) => ({
  appState: state.appState.appState
});

const mapDispatchToProps = {
  applicationChangeState,
  setDeeplink,
  navigateToDeeplink
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RootContainer);
