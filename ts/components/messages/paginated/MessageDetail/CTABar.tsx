import { View } from "native-base";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import { ServicePublicService_metadata } from "../../../../../definitions/backend/ServicePublic";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import {
  getCTA,
  isExpired,
  MessagePaymentExpirationInfo
} from "../../../../utils/messages";
import { PaymentData } from "../../../../store/reducers/entities/messages/types";

import PaymentButton from "../../PaymentButton";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

type Props = {
  dueDate?: Date;
  expirationInfo: MessagePaymentExpirationInfo;
  isPaid: boolean;
  markdown: MessageBodyMarkdown;
  messageId: string;
  paymentData?: PaymentData;
  serviceId?: ServiceId;
  serviceMetadata?: ServicePublicService_metadata;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingBottom: Platform.OS === "ios" && DeviceInfo.hasNotch() ? 28 : 15
  }
});

/**
 * A component to show the action buttons of a message.
 * For messages with the proper configuration renders, on a row:
 * - a calendar icon
 * - a button to add/remove a calendar event
 * - a button to show/start a payment
 */
class CTABar extends React.PureComponent<Props> {
  renderCalendarEventButton = () => {
    const { dueDate, isPaid, expirationInfo } = this.props;
    if (dueDate === undefined || isPaid || isExpired(expirationInfo)) {
      return null;
    }
    // TODO: https://pagopa.atlassian.net/browse/IA-461
    // return <CalendarEventButton message={this.props.message} />;
    return null;
  };

  // return a payment button only when the advice is not paid and the payment_data is defined
  renderPaymentButton(): React.ReactNode {
    const { isPaid, paymentData } = this.props;
    if (isPaid || paymentData === undefined) {
      return null;
    }
    const { amount, noticeNumber, payee } = paymentData;
    return (
      <PaymentButton
        amount={amount}
        noticeNumber={noticeNumber}
        organizationFiscalCode={payee.fiscalCode}
      />
    );
  }

  public render() {
    const { serviceId, markdown, serviceMetadata } = this.props;

    const paymentButton = this.renderPaymentButton();
    const calendarButton = this.renderCalendarEventButton();

    const footer1 = (paymentButton || calendarButton) && (
      <View footer={true} style={styles.row}>
        {calendarButton}
        {paymentButton && calendarButton && <View hspacer={true} />}
        {paymentButton}
      </View>
    );
    const maybeCtas = getCTA(markdown, serviceMetadata, serviceId);
    const footer2 = maybeCtas.isSome() && (
      <View footer={true} style={styles.row}>
        {/* TODO: remove dispatch
        <ExtractedCTABar
          ctas={maybeCtas.value}
          xsmall={false}
          dispatch={this.props.dispatch}
          serviceMetadata={maybeServiceMetadata}
          service={this.props.service}
        />
        */}
      </View>
    );
    return (
      <View>
        {footer2}
        {footer1}
      </View>
    );
  }
}

export default CTABar;
