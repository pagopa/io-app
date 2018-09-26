import Instabug, { invocationMode } from "instabug-reactnative";
import * as React from "react";
import { StyleSheet, TouchableHighlight } from "react-native";

import IconFont from "./ui/IconFont";

const styles = StyleSheet.create({
  button: {
    paddingLeft: 10,
    paddingRight: 10
  }
});

interface Props {
  color?: string;
}

export class InstabugButtons extends React.PureComponent<Props, {}> {
  private handleIBChatPress() {
    Instabug.invokeWithInvocationMode(invocationMode.chatsList);
  }

  private handleIBBugPress() {
    Instabug.invokeWithInvocationMode(invocationMode.newBug);
  }

  public render() {
    return (
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
    );
  }
}
