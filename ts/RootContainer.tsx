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
  setDeepLink
} from "./store/actions/deepLink";
import { ApplicationState } from "./store/actions/types";
import { DeepLinkState } from "./store/reducers/deepLink";
import {
  isPinLoginValidSelector,
  PinLoginState
} from "./store/reducers/pinlogin";
import { GlobalState } from "./store/reducers/types";
import { getNavigateActionFromDeepLink } from "./utils/deepLink";

type ReduxMappedProps = {
  pinLoginState: PinLoginState;
  deepLinkState: DeepLinkState;
  isPinValid: boolean;
};

type DispatchProps = {
  applicationChangeState: typeof applicationChangeState;
  setDeepLink: typeof setDeepLink;
  navigateToDeepLink: typeof navigateToDeepLink;
};

type Props = ReduxMappedProps & DispatchProps;

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
    const action = getNavigateActionFromDeepLink(url);
    // immediately navigate to the resolved action
    this.props.setDeepLink(action, true);
  };

  public componentDidMount() {
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
      deepLinkState: { deepLink, immediate },
      isPinValid
    } = this.props;

    if (immediate && deepLink && isPinValid) {
      this.props.navigateToDeepLink(deepLink);
    }
  }

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
