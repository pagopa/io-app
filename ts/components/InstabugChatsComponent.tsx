import { none, Option } from "fp-ts/lib/Option";
import { BugReporting, Replies } from "instabug-reactnative";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { openInstabugReplies } from "../boot/configureInstabug";
import I18n from "../i18n";
import { instabugReportOpened } from "../store/actions/debug";
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
  instabugReportType: Option<BugReporting.reportType>;
  hasChats: boolean;
};

/**
 * A component to access the list of chats started with the assistance.
 * The icon has a badge if there are unread messages from the assistance
 */
class InstabugChatsComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      instabugReportType: none,
      hasChats: false
    };
  }

  private checkInstabugChats = () => {
    Replies.hasChats(hasChats => {
      this.setState({ hasChats });
    });
  };

  public componentDidMount() {
    this.checkInstabugChats();
  }

  private handleIBChatPress = () => {
    this.props.openQuestionReport();
    openInstabugReplies();
  };

  private getUnreadMessagesDescription = () => {
    if (this.props.badge === 0) {
      return "";
    }
    return this.props.badge === 1
      ? I18n.t("global.accessibility.chat.unread_singular", {
          messages: this.props.badge
        })
      : I18n.t("global.accessibility.chat.unread_plural", {
          messages: this.props.badge
        });
  };

  public render() {
    // we render the chat icon if the user has previous or new chats with the support team
    const canRenderChatsIcon = this.state.hasChats || this.props.badge > 0;
    const accessibilityHint = this.getUnreadMessagesDescription();
    return (
      <React.Fragment>
        {canRenderChatsIcon && (
          <View>
            <ButtonDefaultOpacity
              onPress={this.handleIBChatPress}
              transparent={true}
              accessibilityLabel={I18n.t(
                "global.accessibility.chat.description"
              )}
              accessibilityHint={accessibilityHint}
            >
              <IconFont name="io-chat" color={this.props.color} />
            </ButtonDefaultOpacity>
            <CustomBadge
              badgeStyle={styles.badgeStyle}
              textStyle={styles.textStyle}
              badgeValue={this.props.badge}
            />
          </View>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  badge: instabugMessageStateSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  openQuestionReport: () =>
    dispatch(instabugReportOpened({ type: BugReporting.reportType.question }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InstabugChatsComponent);
