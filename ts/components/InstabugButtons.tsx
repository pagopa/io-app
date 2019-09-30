import { BugReporting, Chats, Replies } from "instabug-reactnative";

import { none, Option, some } from "fp-ts/lib/Option";
import { Button } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import {
  instabugReportClosed,
  instabugReportOpened
} from "../store/actions/debug";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import variables from "../theme/variables";
import CustomBadge from "./ui/CustomBadge";
import IconFont from "./ui/IconFont";

interface OwnProps {
  color?: string;
}

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  instabugReportType: Option<string>;
  badgeValue: number;
};

const styles = StyleSheet.create({
  textStyle: {
    paddingLeft: 0,
    paddingRight: 0
  },
  badgeStyle: {
    backgroundColor: variables.brandPrimary,
    borderColor: "white",
    borderWidth: 2,
    position: "absolute",
    elevation: 0.1,
    shadowColor: "white",
    height: 19,
    width: 19,
    left: 20,
    bottom: 20,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: "center",
    alignContent: "center"
  }
});

class InstabugButtonsComponent extends React.PureComponent<Props, State> {
  private handleIBChatPress = () => {
    const chat = "chat";
    this.setState({ instabugReportType: some(chat) });
    this.props.dispatchIBReportOpen(chat);
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
    const bug = "bug";
    this.setState({ instabugReportType: some(bug) });
    this.props.dispatchIBReportOpen(bug);
    BugReporting.showWithOptions(BugReporting.reportType.bug, [
      BugReporting.option.commentFieldRequired
    ]);
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      instabugReportType: none,
      badgeValue: 0
    };
  }
  public componentDidMount() {
    // Register to the instabug dismiss event. (https://docs.instabug.com/docs/react-native-bug-reporting-event-handlers#section-after-dismissing-instabug)
    // This event is fired when chat or bug screen is dismissed
    BugReporting.onSDKDismissedHandler(
      (dismiss: string, _: string): void => {
        // Due an Instabug library bug, we can't use the report parameter because it always has "bug" as value.
        // We need to differentiate the type of report then use instabugReportType
        if (this.state.instabugReportType.isSome()) {
          this.props.dispatchIBReportClosed(
            this.state.instabugReportType.value,
            dismiss
          );
        }
      }
    );

    Replies.getUnreadRepliesCount(count => {
      this.setState({
        badgeValue: count
      });
      return count;
    });
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
          <CustomBadge
            badgeStyle={styles.badgeStyle}
            textStyle={styles.textStyle}
            badgeValue={this.state.badgeValue}
          />
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
