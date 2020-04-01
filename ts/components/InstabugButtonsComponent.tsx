import { BugReporting, Chats, Replies } from "instabug-reactnative";

import { none, Option, some } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { H3, Text, View } from "native-base";
import * as React from "react";
import { Linking, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { connect } from "react-redux";
import {
  instabugReportClosed,
  instabugReportOpened
} from "../store/actions/debug";
import { updateInstabugUnreadMessages } from "../store/actions/instabug";
import { Dispatch } from "../store/actions/types";
import { instabugMessageStateSelector } from "../store/reducers/instabug/instabugUnreadMessages";
import { GlobalState } from "../store/reducers/types";
import customVariables from "../theme/variables";
import { ioItaliaLink } from "../utils/deepLink";
import ButtonWithImage from "./ButtonWithImage";

const styles = StyleSheet.create({
  margin: {
    marginTop: 10,
    marginBottom: 10
  },

  link: {
    color: customVariables.brandPrimary,
    textDecorationLine: "underline"
  },

  description: {
    fontSize: customVariables.fontSizeBase,
    textAlign: "left"
  }
});

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  instabugReportType: Option<string>;
};

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

  private handleLinkClick = () =>
    Linking.canOpenURL(ioItaliaLink).then(supported => {
      if (supported) {
        // tslint:disable-next-line: no-floating-promises
        Linking.openURL(ioItaliaLink);
      }
    });

  constructor(props: Props) {
    super(props);
    this.state = {
      instabugReportType: none
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
  }

  private buttonWithDescription = (
    icon: string,
    onClick: () => void,
    text: string,
    description: string
  ) => (
    <React.Fragment>
      <ButtonWithImage
        icon={icon}
        onClick={onClick}
        text={text}
        disabled={false}
        light={true}
      />
      <Text style={[styles.margin, styles.description]}>{description}</Text>
    </React.Fragment>
  );

  public render() {
    return (
      <React.Fragment>
        <H3 style={styles.margin}>
          {I18n.t("instabug.contextualHelp.title1")}
        </H3>

        {this.buttonWithDescription(
          "io-messaggi",
          this.handleIBChatPress,
          I18n.t("instabug.contextualHelp.buttonChat"),
          I18n.t("instabug.contextualHelp.descriptionChat")
        )}

        {this.buttonWithDescription(
          "io-bug",
          this.handleIBBugPress,
          I18n.t("instabug.contextualHelp.buttonBug"),
          I18n.t("instabug.contextualHelp.descriptionBug")
        )}
        <View spacer={true} />
        <H3 style={styles.margin}>
          {I18n.t("instabug.contextualHelp.title2")}
        </H3>
        <Text style={[styles.margin, styles.description]}>
          {I18n.t("instabug.contextualHelp.descriptionLink")}
          <TouchableWithoutFeedback onPress={this.handleLinkClick}>
            <Text style={styles.link}> io.italia.it</Text>
          </TouchableWithoutFeedback>
        </Text>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InstabugButtonsComponent);
