import { Button, H1, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import I18n from "../../i18n";

import { PaymentData } from "../../../definitions/backend/PaymentData";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

import IconFont from "../../components/ui/IconFont";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import Markdown from "../ui/Markdown";

import variables from "../../theme/variables";

import { formatPaymentAmount } from "../../utils/payment";

import { MessageWithContentPO } from "../../types/MessageWithContentPO";

import MessageDetailsInfoComponent from "./MessageDetailsInfoComponent";

export type OwnProps = Readonly<{
  message: MessageWithContentPO;
  senderService: ServicePublic | undefined;
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

  // Render the Message CTAs if the message contains PaymentData
  private renderMessageCTA = (
    paymentData: PaymentData,
    dispatchPaymentAction: (() => void) | undefined
  ) => {
    return paymentData ? (
      <View style={styles.messageCTAContainer}>
        <Button block={true} primary={true} onPress={dispatchPaymentAction}>
          <Text>
            {I18n.t("messages.cta.pay", {
              amount: formatPaymentAmount(paymentData.amount)
            })}
          </Text>
        </Button>
      </View>
    ) : null;
  };

  public render() {
    const message = this.props.message;

    const senderService = this.props.senderService;

    const dispatchPaymentAction = this.props.dispatchPaymentAction;

    const { subject, markdown, payment_data } = message;
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
        {payment_data &&
          dispatchPaymentAction &&
          this.renderMessageCTA(payment_data, dispatchPaymentAction)}
        <View style={styles.messageContentContainer}>
          {markdown ? (
            <Markdown lazy={true}>{markdown}</Markdown>
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
