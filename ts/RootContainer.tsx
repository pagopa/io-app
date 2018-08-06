import { Root } from "native-base";
import * as React from "react";
import { AppState, Linking, Platform, StatusBar } from "react-native";
import { NavigationNavigateActionPayload } from "react-navigation";
import { connect } from "react-redux";

import ConnectionBar from "./components/ConnectionBar";
import VersionInfoOverlay from "./components/VersionInfoOverlay";
import Navigation from "./navigation";
import {
  ApplicationChangeState,
  applicationChangeState
} from "./store/actions/application";
import {
  NavigateToDeepLink,
  navigateToDeepLink,
  SetDeepLink,
  setDeepLink
} from "./store/actions/deepLink";
import { ApplicationState } from "./store/actions/types";
import { DeepLinkState } from "./store/reducers/deepLink";
import {
  isPinLoginValidSelector,
  PinLoginState
} from "./store/reducers/pinlogin";
import { GlobalState } from "./store/reducers/types";
import { getNavigationPayloadFromDeepLink } from "./utils/deepLink";

type ReduxMappedProps = {
  pinLoginState: PinLoginState;
  deepLinkState: DeepLinkState;
  isPinValid: boolean;
};

type DispatchProps = {
  applicationChangeState: (
    activity: ApplicationState
  ) => ApplicationChangeState;
  setDeepLink: (
    navigationPayload: NavigationNavigateActionPayload
  ) => SetDeepLink;
  navigateToDeepLink: (
    navigationPayload: NavigationNavigateActionPayload
  ) => NavigateToDeepLink;
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
        .catch(console.error); // tslint:disable-line:no-console
    } else {
      Linking.addEventListener("url", this.handleOpenURL);
    }

    AppState.addEventListener("change", this.handleApplicationActivityChange);
  }

  public componentDidUpdate() {
    const {
      deepLinkState: { deepLink },
      isPinValid
    } = this.props;

    if (deepLink && isPinValid) {
      this.props.navigateToDeepLink(deepLink);
    }
  }

  public componentWillUnmount() {
    if (Platform.OS === "ios") {
      Linking.removeEventListener("url", this.handleOpenURL);
    }

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

    this.props.setDeepLink(getNavigationPayloadFromDeepLink(url));
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
  pinLoginState: state.pinlogin,
  deepLinkState: state.deepLink,
  isPinValid: isPinLoginValidSelector(state)
});

const mapDispatchToProps = {
  applicationChangeState,
  setDeepLink,
  navigateToDeepLink
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RootContainer);
