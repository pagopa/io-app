import { fromNullable, fromPredicate } from "fp-ts/lib/Option";
import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ReduxProps } from "../../store/actions/types";
import { PaidReason } from "../../store/reducers/entities/payments";
import { isExpired, paymentExpirationInfo } from "../../utils/messages";
import CalendarEventButton from "./CalendarEventButton";
import { MessageNestedCTABar } from "./MessageNestedCTABar";
import PaymentButton from "./PaymentButton";

type Props = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
} & ReduxProps;

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

  // Render a button to display details of the payment related to the message
  private renderPaymentButton() {
    if (this.paid) {
      return null;
    }
    // The button is displayed if the payment has an expiration date in the future
    return this.paymentExpirationInfo.fold(null, pei => {
      const { message, service } = this.props;
      return (
        <PaymentButton
          paid={this.paid}
          messagePaymentExpirationInfo={pei}
          service={service}
          message={message}
        />
      );
    });
  }

  public render() {
    const paymentButton = this.renderPaymentButton();
    const calendarButton = this.renderCalendarEventButton();
    const footer1 = (paymentButton || calendarButton) && (
      <View footer={true} style={styles.row}>
        {calendarButton}
        {paymentButton && calendarButton && <View hspacer={true} />}
        {paymentButton}
      </View>
    );
    const nestedCTAs = (
      <MessageNestedCTABar
        message={this.props.message}
        dispatch={this.props.dispatch}
        xsmall={false}
      />
    );
    const footer2 = nestedCTAs && (
      <View footer={true} style={styles.row}>
        {nestedCTAs}
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

export default connect()(MessageDetailCTABar);
