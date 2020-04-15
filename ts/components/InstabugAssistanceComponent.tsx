import { none, Option, some } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { BugReporting } from "instabug-reactnative";
import { H3, Text, View } from "native-base";
import * as React from "react";
import { Platform } from "react-native";
import { connect } from "react-redux";
import {
  instabugReportClosed,
  instabugReportOpened
} from "../store/actions/debug";
import { updateInstabugUnreadMessages } from "../store/actions/instabug";
import { Dispatch } from "../store/actions/types";
import { instabugMessageStateSelector } from "../store/reducers/instabug/instabugUnreadMessages";
import { GlobalState } from "../store/reducers/types";
import ButtonWithImage from "./ButtonWithImage";

type OwnProps = Readonly<{
  onInstabugReportOpening: () => void;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

type State = {
  instabugReportType: Option<BugReporting.reportType>;
};

// estimated. Values below 250 makes modal being partially displayed on the screenFshot
const MODAL_SLIDE_ANIMATION_DURATION = Platform.select({
  ios: 250,
  android: 50
});

/**
 * A component to send a request to the assistance by Instabug functionalities.
 */
class InstabugAssistanceComponent extends React.PureComponent<Props, State> {
  private handleIBPress = (type: BugReporting.reportType) => {
    this.setState({ instabugReportType: some(type) });
    this.props.onInstabugReportOpening();
    setTimeout(() => {
      this.props.dispatchIBReportOpen(type);
      BugReporting.showWithOptions(type, [
        BugReporting.option.commentFieldRequired,
        BugReporting.option.emailFieldHidden
      ]);
    }, MODAL_SLIDE_ANIMATION_DURATION);
  };

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

  public render() {
    return (
      <React.Fragment>
        <H3>{I18n.t("instabug.contextualHelp.title1")}</H3>
        <View spacer={true} />
        <View spacer={true} extrasmall={true} />
        {/** TODO: add new io-send-message icon */}
        <ButtonWithImage
          icon={"io-messaggi"}
          onClick={() => this.handleIBPress(BugReporting.reportType.question)}
          text={I18n.t("instabug.contextualHelp.buttonChat")}
          disabled={false}
          light={true}
        />
        <View spacer={true} />
        <Text>{I18n.t("instabug.contextualHelp.descriptionChat")}</Text>
        <View spacer={true} />

        <ButtonWithImage
          icon={"io-bug"}
          onClick={() => this.handleIBPress(BugReporting.reportType.bug)}
          text={I18n.t("instabug.contextualHelp.buttonBug")}
          disabled={false}
          light={true}
        />
        <View spacer={true} />
        <Text>{I18n.t("instabug.contextualHelp.descriptionBug")}</Text>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  badge: instabugMessageStateSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchIBReportOpen: (type: BugReporting.reportType) =>
    dispatch(instabugReportOpened({ type })),
  dispatchIBReportClosed: (type: BugReporting.reportType, how: string) =>
    dispatch(instabugReportClosed({ type, how })),
  dispatchUpdateInstabugUnreadMessagesCounter: () =>
    dispatch(updateInstabugUnreadMessages())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InstabugAssistanceComponent);
