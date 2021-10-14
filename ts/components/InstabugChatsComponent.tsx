import { none, Option } from "fp-ts/lib/Option";
import { BugReporting, Replies } from "instabug-reactnative";
import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { openInstabugReplies } from "../boot/configureInstabug";
import I18n from "../i18n";
import { instabugReportOpened } from "../store/actions/debug";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import { instabugMessageStateSelector } from "../store/reducers/instabug/instabugUnreadMessages";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import CustomBadge from "./ui/CustomBadge";
import IconFont from "./ui/IconFont";

interface OwnProps {
  color?: string;
}

type Props = ReturnType<typeof mapStateToProps> &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  instabugReportType: Option<BugReporting.reportType>;
  hasChats: boolean;
  isMounted: boolean;
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
      hasChats: false,
      isMounted: false
    };
  }

  public componentDidMount() {
    this.setState({ isMounted: true });

    Replies.hasChats(hasChats => {
      if (this.state.isMounted) {
        this.setState({ hasChats });
      }
    });
  }

  public componentWillUnmount() {
    this.setState({ isMounted: false });
  }

  private handleIBChatPress = () => {
    this.props.dispatchOpenReportQuestion();
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
    if (!canRenderChatsIcon) {
      return null;
    }
    const accessibilityHint = this.getUnreadMessagesDescription();
    return (
      <ButtonDefaultOpacity
        onPress={this.handleIBChatPress}
        transparent={true}
        accessibilityLabel={I18n.t("global.accessibility.chat.description")}
        accessibilityHint={accessibilityHint}
      >
        <IconFont name="io-chat" color={this.props.color} />
        {this.props.badge > 0 && (
          <View style={{ position: "absolute", left: 6, bottom: 10 }}>
            <CustomBadge badgeValue={this.props.badge} />
          </View>
        )}
      </ButtonDefaultOpacity>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  badge: instabugMessageStateSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchOpenReportQuestion: () =>
    dispatch(instabugReportOpened({ type: BugReporting.reportType.question }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InstabugChatsComponent);
