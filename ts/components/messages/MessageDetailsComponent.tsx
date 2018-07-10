import { Button, H1, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { PaymentData } from "../../../definitions/backend/PaymentData";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { formatPaymentAmount } from "../../utils/payment";
import Markdown from "../ui/Markdown";
import MessageDetailsInfoComponent from "./MessageDetailsInfoComponent";

export type OwnProps = Readonly<{
  createdAt: Date;
  id: string;
  markdown: string;
  paymentData: PaymentData;
  serviceDepartmentName: string;
  serviceName: string;
  serviceOrganizationName: string;
  subject: string;
  onPaymentCTAClick: (paymentData: PaymentData) => void;
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
  private renderMessageCTA = (paymentData: PaymentData) => {
    return paymentData ? (
      <View style={styles.messageCTAContainer}>
        <Button
          block={true}
          primary={true}
          onPress={() => this.props.onPaymentCTAClick(paymentData)}
        >
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
    const {
      subject,
      markdown,
      createdAt,
      paymentData,
      serviceOrganizationName,
      serviceDepartmentName,
      serviceName
    } = this.props;
    return (
      <View>
        <View style={styles.messageHeaderContainer}>
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
              createdAt={createdAt}
              serviceName={serviceName}
              serviceDepartmentName={serviceDepartmentName}
              serviceOrganizationName={serviceOrganizationName}
            />
          )}
        </View>
        {this.renderMessageCTA(paymentData)}
        <View style={styles.messageContentContainer}>
          <Markdown>{markdown}</Markdown>
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
