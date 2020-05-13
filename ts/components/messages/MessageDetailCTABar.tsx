import { fromNullable, fromPredicate } from "fp-ts/lib/Option";
import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { PaidReason } from "../../store/reducers/entities/payments";
import {
  isExpired,
  isExpiring,
  paymentExpirationInfo
} from "../../utils/messages";
import CalendarEventButton from "./CalendarEventButton";
import PaymentButton from "./PaymentButton";

type Props = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  }
});

/**
 * A component to show the action buttons of a message.
 * For messages with the proper configuration renders, on a row:
 * - a calendar icon
 * - a button to add/remove a calendar event
 * - a button to show/start a payment
 */
class MessageDetailCTABar extends React.PureComponent<Props> {
  get paymentExpirationInfo() {
    return paymentExpirationInfo(this.props.message);
  }

  get paid(): boolean {
    return this.props.payment !== undefined;
  }

  get isPaymentExpired() {
    return this.paymentExpirationInfo.fold(false, info => isExpired(info));
  }

  get isPaymentExpiring() {
    return this.paymentExpirationInfo.fold(false, info => isExpiring(info));
  }

  get dueDate() {
    return fromNullable(this.props.message.content.due_date);
  }

  // Render a button to add/remove an event related to the message in the calendar
  private renderCalendarEventButton = () => {
    // The add/remove reminder button is hidden:
    // - if the message hasn't a due date
    // - if the message has a payment and it has been paid or is expired
    return this.dueDate
      .chain(fromPredicate(() => !this.paid && !this.isPaymentExpired))
      .fold(null, _ => {
        return <CalendarEventButton message={this.props.message} />;
      });
  };

  // Render abutton to display details of the payment related to the message
  private renderPaymentButton() {
    const { message, service } = this.props;

    // The button is displayed if the payment has an expiration date in the future
    if (this.paymentExpirationInfo.isNone()) {
      return null;
    }

    return (
      <PaymentButton
        paid={this.paid}
        messagePaymentExpirationInfo={this.paymentExpirationInfo.value}
        service={service}
        message={message}
      />
    );
  }

  public render() {
    const paymentButton = this.renderPaymentButton();
    const calendarButton = this.renderCalendarEventButton();

    if (paymentButton && calendarButton) {
      return (
        <View footer={true} style={styles.row}>
          {this.renderCalendarEventButton()}
          {paymentButton !== null &&
            calendarButton !== null && <View hspacer={true} />}
          {this.renderPaymentButton()}
        </View>
      );
    }
    return null;
  }
}

export default MessageDetailCTABar;
