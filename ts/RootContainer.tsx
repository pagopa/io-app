import { Root, Text, View } from "native-base";
import * as React from "react";
import { AppState, StatusBar, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { connect } from "react-redux";

import ConnectionBar from "./components/ConnectionBar";
import Navigation from "./navigation";
import { APP_STATE_CHANGE_ACTION } from "./store/actions/constants";
import { ApplicationState, ReduxProps } from "./store/actions/types";
import { environment } from "./config";

interface ReduxMappedProps {}

interface OwnProps {}

type Props = ReduxMappedProps & ReduxProps & OwnProps;

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    zIndex: 1000
  },

  versionText: {
    fontSize: 12,
    color: "#000000"
  }
});

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
        {environment === "DEV" && (
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>
              {DeviceInfo.getReadableVersion()}
            </Text>
          </View>
        )}
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
