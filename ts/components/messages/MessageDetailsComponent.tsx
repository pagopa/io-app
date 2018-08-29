import { H1, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { EventCreationResult } from "react-native-add-calendar-event";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import Markdown from "../ui/Markdown";
import { MessageCTABar } from "./MessageCTABar";
import MessageDetailsInfoComponent from "./MessageDetailsInfoComponent";

export type OwnProps = Readonly<{
  message: MessageWithContentPO;
  senderService: ServicePublic | undefined;
  dispatchReminderAction: (() => Promise<EventCreationResult>) | undefined;
  dispatchPaymentAction: (() => void) | undefined;
  navigateToServicePreferences: (() => void) | undefined;
}>;

type State = Readonly<{
  isMessageDetailsInfoVisible: boolean;
}>;

export type Props = OwnProps;

const styles = StyleSheet.create({
  messageHeaderContainer: {
    padding: variables.contentPadding
  },

  messageDetailsLinkContainer: {
    flexDirection: "row"
  },

  messageCTAContainer: {
    backgroundColor: variables.contentAlternativeBackground,
    padding: variables.contentPadding
  },

  messageContentContainer: {
    padding: variables.contentPadding
  }
});

/**
 * Implements a component that show the message details
 */
class MessageDetailsComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isMessageDetailsInfoVisible: false };
  }

  private handleDetailsInfoClick = (isVisible: boolean) => {
    this.setState({ isMessageDetailsInfoVisible: !isVisible });
  };

  private renderDetailsInfoLink = () => {
    if (!this.state.isMessageDetailsInfoVisible) {
      return (
        <View style={styles.messageDetailsLinkContainer}>
          <Text link={true}>
            {I18n.t("messageDetails.detailsLink.showLabel")}
          </Text>
          <IconFont name="io-right" />
        </View>
      );
    } else {
      return (
        <View style={styles.messageDetailsLinkContainer}>
          <Text link={true}>
            {I18n.t("messageDetails.detailsLink.hideLabel")}
          </Text>
          <IconFont name="io-close" />
        </View>
      );
    }
  };

  public render() {
    const message = this.props.message;

    const senderService = this.props.senderService;

    const dispatchReminderAction = this.props.dispatchReminderAction;

    const dispatchPaymentAction = this.props.dispatchPaymentAction;

    const { subject, due_date, markdown, payment_data } = message;
    return (
      <View>
        <View style={styles.messageHeaderContainer}>
          {senderService && <H4>{senderService.organization_name}</H4>}
          {senderService && (
            <H6 link={true} onPress={this.props.navigateToServicePreferences}>
              {senderService.service_name}
            </H6>
          )}
          {senderService && <View spacer={true} />}
          <H1>{subject}</H1>
          <View spacer={true} />
          <TouchableOpacity
            onPress={() =>
              this.handleDetailsInfoClick(
                this.state.isMessageDetailsInfoVisible
              )
            }
          >
            <View>{this.renderDetailsInfoLink()}</View>
          </TouchableOpacity>
          {this.state.isMessageDetailsInfoVisible && (
            <MessageDetailsInfoComponent
              message={message}
              senderService={senderService}
              navigateToServicePreferences={
                this.props.navigateToServicePreferences
              }
            />
          )}
        </View>
        <MessageCTABar
          dueDate={due_date}
          dispatchReminderAction={dispatchReminderAction}
          paymentData={payment_data}
          dispatchPaymentAction={dispatchPaymentAction}
          containerStyle={styles.messageCTAContainer}
        />
        <View style={styles.messageContentContainer}>
          {markdown ? (
            <Markdown>{markdown}</Markdown>
          ) : (
            <Text>{I18n.t("messages.noContent")}</Text>
          )}
        </View>
      </View>
    );
  }
}

const StyledMessageDetailsComponent = connectStyle(
  "UIComponent.MessageDetailsComponent",
  {},
  mapPropsToStyleNames
)(MessageDetailsComponent);
export default StyledMessageDetailsComponent;
