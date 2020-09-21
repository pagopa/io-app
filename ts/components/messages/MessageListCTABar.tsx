import { fromNullable, Option } from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ReduxProps } from "../../store/actions/types";
import { PaidReason } from "../../store/reducers/entities/payments";
import customVariables from "../../theme/variables";
import { formatDateAsDay, formatDateAsMonth } from "../../utils/dates";
import { getCTA, isExpired, paymentExpirationInfo } from "../../utils/messages";
import CalendarEventButton from "./CalendarEventButton";
import CalendarIconComponent from "./CalendarIconComponent";
import MessageNestedCTABar from "./MessageNestedCTABar";
import PaymentButton from "./PaymentButton";

type Props = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
  disabled?: boolean;
} & ReduxProps;

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: "row"
  },
  topContainerLarge: {
    paddingVertical: customVariables.contentPadding / 2,
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.brandGray
  },
  topContainerPaid: {
    paddingVertical: 0,
    paddingHorizontal: 0
  }
});

/**
 * A component to show the action buttons of a message.
 * For messages with the proper configuration renders, on a row:
 * - a calendar icon
 * - a button to add/remove a calendar event
 * - a button to show/start a payment
 * - cta defined inside the markdown content as front-matter
 */
class MessageListCTABar extends React.PureComponent<Props> {
  get paymentExpirationInfo() {
    return paymentExpirationInfo(this.props.message);
  }

  get paid(): boolean {
    return this.props.payment !== undefined;
  }

  get isPaymentExpired() {
    return this.paymentExpirationInfo.fold(false, info => isExpired(info));
  }

  get hasPaymentData() {
    return this.paymentExpirationInfo.fold(false, _ => true);
  }

  get dueDate(): Option<Date> {
    return fromNullable(this.props.message.content.due_date);
  }

  private renderCalendarIcon = () => {
    const { dueDate } = this;

    // The calendar icon is shown if:
    // - the message has a due date
    // - the payment related to the message is not yet paid
    if (dueDate.isSome() && !this.paid) {
      return (
        <CalendarIconComponent
          small={true}
          month={capitalize(formatDateAsMonth(dueDate.value))}
          day={formatDateAsDay(dueDate.value)}
          backgroundColor={customVariables.brandDarkGray}
          textColor={customVariables.colorWhite}
        />
      );
    }
    return undefined;
  };

  // Render a button to add/remove an event related to the message in the calendar
  private renderCalendarEventButton = () =>
    // The add/remove reminder button is shown if:
    // - if the message has a due date
    // - if the message has a payment and it is not paid nor expired
    this.dueDate
      .filter(() => !this.paid && !this.isPaymentExpired)
      .fold(undefined, _ => (
        <CalendarEventButton
          small={true}
          disabled={this.props.disabled}
          message={this.props.message}
        />
      ));

  // Render a button to display details of the payment related to the message
  private renderPaymentButton() {
    // The button is displayed if the payment has an expiration date in the future
    return this.paymentExpirationInfo.fold(undefined, pei => {
      const { message, service, disabled } = this.props;
      const { paid } = this;
      return (
        <PaymentButton
          paid={paid}
          messagePaymentExpirationInfo={pei}
          small={true}
          disabled={disabled}
          service={service}
          message={message}
          enableAlertStyle={true}
        />
      );
    });
  }

  public render() {
    const calendarIcon = this.renderCalendarIcon();
    const calendarEventButton = this.renderCalendarEventButton();
    const maybeCTA = getCTA(this.props.message);
    // payment CTA has priority to nested CTA
    const nestedCTA =
      !this.hasPaymentData && maybeCTA.isSome() ? (
        <MessageNestedCTABar
          ctas={maybeCTA.value}
          dispatch={this.props.dispatch}
          xsmall={true}
          service={this.props.service}
        />
      ) : null;
    const content = nestedCTA || (
      <>
        {calendarIcon}
        {calendarIcon && <View hspacer={true} small={true} />}
        {calendarEventButton}
        {calendarEventButton && <View hspacer={true} small={true} />}
        {this.renderPaymentButton()}
      </>
    );
    return (
      <View
        style={[styles.topContainer, this.paid && styles.topContainerPaid]}
        accessible={false}
        accessibilityElementsHidden={true}
        importantForAccessibility={"no-hide-descendants"}
      >
        {content}
      </View>
    );
  }
}

export default connect()(MessageListCTABar);
