import { BugReporting, Chats, Replies } from "instabug-reactnative";

import { Button } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import {
  instabugReportClosed,
  instabugReportOpened
} from "../store/actions/debug";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import IconFont from "./ui/IconFont";

interface OwnProps {
  color?: string;
}

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  instabugReportType: "bug" | "chat" | "undefined";
};

class InstabugButtonsComponent extends React.PureComponent<Props, State> {
  private handleIBChatPress = () => {
    this.setState({ instabugReportType: "chat" });
    this.props.dispatchIBReportOpen(this.state.instabugReportType);
    // Check if there are previous chat
    Replies.hasChats(hasChats => {
      if (hasChats) {
        Replies.show();
      } else {
        Chats.show();
      }
    });
  };

  private handleIBBugPress = () => {
    this.setState({ instabugReportType: "bug" });
    this.props.dispatchIBReportOpen(this.state.instabugReportType);
    BugReporting.showWithOptions(BugReporting.reportType.bug, [
      BugReporting.option.commentFieldRequired
    ]);
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      instabugReportType: "undefined"
    };
  }
  public componentDidMount() {
    // Register to the instabug dismiss event. (https://docs.instabug.com/docs/react-native-bug-reporting-event-handlers#section-after-dismissing-instabug)
    // This event is fired when chat or bug screen is dismissed
    BugReporting.onSDKDismissedHandler(
      (dismiss: string): void => {
        if (this.state.instabugReportType !== "undefined") {
          this.props.dispatchIBReportClosed(
            this.state.instabugReportType,
            dismiss
          );
        }
      }
    );
  }

  public render() {
    return (
      this.props.isDebugModeEnabled && (
        <React.Fragment>
          <Button onPress={this.handleIBChatPress} transparent={true}>
            <IconFont
              name="io-chat"
              color={this.props.color}
              accessible={true}
              accessibilityLabel="io-chat"
            />
          </Button>
          <Button onPress={this.handleIBBugPress} transparent={true}>
            <IconFont
              name="io-bug"
              color={this.props.color}
              accessible={true}
              accessibilityLabel="io-bug"
            />
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
