import { fromNullable, fromPredicate, Option } from "fp-ts/lib/Option";
import { View } from "native-base";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { connect } from "react-redux";
import DeviceInfo from "react-native-device-info";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { PaidReason } from "../../store/reducers/entities/payments";
import { GlobalState } from "../../store/reducers/types";
import {
  getCTA,
  isExpirable,
  isExpired,
  MessagePaymentExpirationInfo,
  paymentExpirationInfo
} from "../../utils/messages";
import { Dispatch } from "../../store/actions/types";
import ExtractedCTABar from "../cta/ExtractedCTABar";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import CalendarEventButton from "./CalendarEventButton";
import PaymentButton from "./PaymentButton";

type OwnProps = {
  message: CreatedMessageWithContentAndAttachments;
  service?: ServicePublic;
  payment?: PaidReason;
};

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

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
class MessageDetailCTABar extends React.PureComponent<Props> {
  get paymentExpirationInfo(): Option<MessagePaymentExpirationInfo> {
    return paymentExpirationInfo(this.props.message);
  }

  get paid(): boolean {
    return this.props.payment !== undefined;
  }

  get isPaymentExpirable() {
    return this.paymentExpirationInfo.fold(false, isExpirable);
  }

  get isPaymentExpired() {
    return this.paymentExpirationInfo.fold(false, isExpired);
  }

  get dueDate() {
    return fromNullable(this.props.message.content.due_date);
  }

  // Render a button to add/remove an event related to the message in the calendar
  private renderCalendarEventButton = () =>
    // The add/remove reminder button is hidden:
    // - if the message hasn't a due date
    // - if the message has a payment and it has been paid or is expired
    this.dueDate
      .chain(fromPredicate(() => !this.paid && !this.isPaymentExpired))
      .fold(null, _ => <CalendarEventButton message={this.props.message} />);

  // Render a button to display details of the payment related to the message
  private renderPaymentButton() {
    if (this.paid) {
      return null;
    }
    // the payment is expired and it is not valid (can't pay after due date)
    if (this.isPaymentExpired && this.isPaymentExpirable) {
      return null;
    }
    // The button is displayed if the payment has an expiration date in the future
    return this.paymentExpirationInfo.fold(null, pei => {
      const { amount, noticeNumber, organizationFiscalCode } = pei;
      return (
        <PaymentButton
          amount={amount}
          noticeNumber={noticeNumber}
          organizationFiscalCode={organizationFiscalCode}
        />
      );
    });
  }

  public render() {
    const maybeServiceMetadata = this.props.service?.service_metadata;

    const paymentButton = this.renderPaymentButton();
    const calendarButton = this.renderCalendarEventButton();
    const footer1 = (paymentButton || calendarButton) && (
      <View footer={true} style={styles.row}>
        {calendarButton}
        {paymentButton && calendarButton && <View hspacer={true} />}
        {paymentButton}
      </View>
    );
    const maybeCtas = getCTA(
      this.props.message,
      maybeServiceMetadata,
      this.props.service?.service_id
    );
    const footer2 = maybeCtas.isSome() && (
      <View footer={true} style={styles.row}>
        <ExtractedCTABar
          ctas={maybeCtas.value}
          xsmall={false}
          dispatch={this.props.dispatch}
          serviceMetadata={maybeServiceMetadata}
          service={this.props.service}
        />
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

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageDetailCTABar);
