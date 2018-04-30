import * as React from "react";
import { AppState, StatusBar } from "react-native";
import { connect } from "react-redux";

import { Root } from "native-base";

import ConnectionBar from "./components/ConnectionBar";

import { ApplicationState, ReduxProps } from "./actions/types";
import Navigation from "./navigation";
import { APP_STATE_CHANGE_ACTION } from "./store/actions/constants";

interface ReduxMappedProps {}

interface OwnProps {}

type Props = ReduxMappedProps & ReduxProps & OwnProps;

/**
 * The main container of the application with the ConnectionBar and the Navigator
 */
class RootContainer extends React.Component<Props> {
  public componentDidMount() {
    AppState.addEventListener("change", this.onApplicationActivityChange);
  }

  public componentWillUnmount() {
    AppState.removeEventListener("change", this.onApplicationActivityChange);
  }

  public render() {
    return (
      <Root>
        <StatusBar barStyle="dark-content" />
        <ConnectionBar />
        <Navigation />
      </Root>
    );
  }

  public onApplicationActivityChange = (activity: ApplicationState) => {
    this.props.dispatch({
      type: APP_STATE_CHANGE_ACTION,
      payload: activity
    });
  };
}

export default connect()(RootContainer);
