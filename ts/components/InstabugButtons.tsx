import Instabug, { invocationMode } from "instabug-reactnative";
import * as React from "react";
import { connect } from "react-redux";

import { Button } from "native-base";
import { GlobalState } from "../store/reducers/types";
import IconFont from "./ui/IconFont";

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
          <Button onPress={this.handleIBChatPress} transparent={true}>
            <IconFont name="io-chat" color={this.props.color} />
          </Button>
          <Button onPress={this.handleIBBugPress} transparent={true}>
            <IconFont name="io-bug" color={this.props.color} />
          </Button>
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
