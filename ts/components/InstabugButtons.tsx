import { BugReporting, Chats } from "instabug-reactnative";
import * as React from "react";
import { connect } from "react-redux";

import { Button } from "native-base";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import {
  instabugReportClosed,
  instabugReportOpened
} from "./../store/actions/debug";
import IconFont from "./ui/IconFont";

interface OwnProps {
  color?: string;
}

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

class InstabugButtonsComponent extends React.PureComponent<Props, {}> {
  private handleIBChatPress = () => {
    this.props.dispatchIBReportOpen("chat");
    Chats.show();
  };

  private handleIBBugPress = () => {
    this.props.dispatchIBReportOpen("bug");
    BugReporting.showWithOptions(BugReporting.reportType.bug, [
      BugReporting.option.commentFieldRequired
    ]);
  };

  public componentDidMount() {
    // Register to the instabug dismiss event. (https://docs.instabug.com/docs/react-native-bug-reporting-event-handlers#section-after-dismissing-instabug)
    // This event is fired when chat or bug screen is dismissed
    BugReporting.onSDKDismissedHandler(
      (dismissType: string, reportType: string): void => {
        this.props.dispatchIBReportClosed(reportType, dismissType);
      }
    );
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchIBReportOpen: (type: string) =>
    dispatch(instabugReportOpened({ type })),
  dispatchIBReportClosed: (type: string, how: string) =>
    dispatch(instabugReportClosed({ type, how }))
});

export const InstabugButtons = connect(
  mapStateToProps,
  mapDispatchToProps
)(InstabugButtonsComponent);
