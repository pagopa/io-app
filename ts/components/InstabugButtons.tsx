import Instabug, { invocationMode } from "instabug-reactnative";
import * as React from "react";
import { StyleSheet, TouchableHighlight } from "react-native";
import { connect } from "react-redux";

import { GlobalState } from "../store/reducers/types";
import IconFont from "./ui/IconFont";

const styles = StyleSheet.create({
  button: {
    paddingLeft: 10,
    paddingRight: 10
  }
});

interface OwnProps {
  color?: string;
}

type Props = ReturnType<typeof mapStateToProps> & OwnProps;

class InstabugButtonsComponent extends React.PureComponent<Props, {}> {
  private handleIBChatPress() {
    Instabug.invokeWithInvocationMode(invocationMode.chatsList);
  }

  private handleIBBugPress() {
    Instabug.invokeWithInvocationMode(invocationMode.newBug);
  }

  public render() {
    return (
      this.props.isDebugModeEnabled && (
        <React.Fragment>
          <TouchableHighlight
            onPress={this.handleIBChatPress}
            style={styles.button}
          >
            <IconFont name="io-chat" color={this.props.color} />
          </TouchableHighlight>
          <TouchableHighlight
            onPress={this.handleIBBugPress}
            style={styles.button}
          >
            <IconFont name="io-bug" color={this.props.color} />
          </TouchableHighlight>
        </React.Fragment>
      )
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isDebugModeEnabled: state.debug.isDebugModeEnabled
});

export const InstabugButtons = connect(mapStateToProps)(
  InstabugButtonsComponent
);
