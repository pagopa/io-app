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
import { DeeplinkState } from "./store/reducers/deeplink";
import {
  isPinloginValidSelector,
  PinLoginState
} from "./store/reducers/pinlogin";
import { GlobalState } from "./store/reducers/types";

type ReduxMappedProps = {
  appState: string;
  pinLoginState: PinLoginState;
  deeplinkState: DeeplinkState;
  isPinValid: boolean;
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

type Props = ReduxMappedProps & DispatchProps;

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

  public componentDidUpdate() {
    const {
      deeplinkState: { deeplink },
      isPinValid
    } = this.props;

    if (deeplink && isPinValid) {
      this.props.navigateToDeeplink(deeplink);
    }
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

    this.props.setDeeplink(deeplinkNavigationPayload);
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
  appState: state.appState.appState,
  pinLoginState: state.pinlogin,
  deeplinkState: state.deeplink,
  isPinValid: isPinloginValidSelector(state)
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
