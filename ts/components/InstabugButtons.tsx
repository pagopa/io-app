import { none, Option, some } from "fp-ts/lib/Option";
import { BugReporting, Chats, Replies } from "instabug-reactnative";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import {
  instabugReportClosed,
  instabugReportOpened
} from "../store/actions/debug";
import { updateInstabugUnreadMessages } from "../store/actions/instabug";
import { Dispatch } from "../store/actions/types";
import { instabugMessageStateSelector } from "../store/reducers/instabug/instabugUnreadMessages";
import { GlobalState } from "../store/reducers/types";
import variables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import CustomBadge from "./ui/CustomBadge";
import IconFont from "./ui/IconFont";

interface OwnProps {
  color?: string;
}

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

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  instabugReportType: Option<string>;
  hasChats: boolean;
};

class InstabugButtonsComponent extends React.PureComponent<Props, State> {
  private handleIBChatPress = () => {
    const chat = "chat";
    this.setState({ instabugReportType: some(chat) });
    this.props.dispatchIBReportOpen(chat);
    if (this.state.hasChats) {
      Replies.show();
    } else {
      Chats.show();
    }
  };

  private handleIBBugPress = () => {
    const bug = "bug";
    this.setState({ instabugReportType: some(bug) });
    this.props.dispatchIBReportOpen(bug);
    BugReporting.showWithOptions(BugReporting.reportType.bug, [
      BugReporting.option.commentFieldRequired,
      BugReporting.option.emailFieldOptional
    ]);
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      instabugReportType: none,
      hasChats: false
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
          // when user dismisses instabug report (chat or bug) we update the unread messages counter.
          // This is because user could have read or reply to some messages
          this.props.dispatchUpdateInstabugUnreadMessagesCounter();
        }
      }
    );
    this.checkInstabugChats();
  }

  private checkInstabugChats = () => {
    Replies.hasChats(hasChats => {
      this.setState({ hasChats });
    });
  };

  public componentDidUpdate(_: Props) {
    // check if instabug has new chats
    this.checkInstabugChats();
  }

  public render() {
    // we render the chat icon if the user has previous or new chats with the support team
    const canRenderChatsIcon = this.state.hasChats || this.props.badge > 0;
    return (
      <React.Fragment>
        {canRenderChatsIcon && (
          <View>
            <ButtonDefaultOpacity
              onPress={this.handleIBChatPress}
              transparent={true}
            >
              <IconFont
                name="io-chat"
                color={this.props.color}
                accessible={true}
                accessibilityLabel="io-chat"
              />
            </ButtonDefaultOpacity>
            <CustomBadge
              badgeStyle={styles.badgeStyle}
              textStyle={styles.textStyle}
              badgeValue={this.props.badge}
            />
          </View>
        )}

        <ButtonDefaultOpacity
          onPress={this.handleIBBugPress}
          transparent={true}
        >
          <IconFont
            name="io-bug"
            color={this.props.color}
            accessible={true}
            accessibilityLabel="io-bug"
          />
        </ButtonDefaultOpacity>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  badge: instabugMessageStateSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchIBReportOpen: (type: string) =>
    dispatch(instabugReportOpened({ type })),
  dispatchIBReportClosed: (type: string, how: string) =>
    dispatch(instabugReportClosed({ type, how })),
  dispatchUpdateInstabugUnreadMessagesCounter: () =>
    dispatch(updateInstabugUnreadMessages())
});

export const InstabugButtons = connect(
  mapStateToProps,
  mapDispatchToProps
)(InstabugButtonsComponent);
