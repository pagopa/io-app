import { fromNullable } from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { View } from "native-base";
import React from "react";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { PaidReason } from "../../store/reducers/entities/payments";
import { formatDateAsDay, formatDateAsMonth } from "../../utils/dates";
import {
  getMessagePaymentExpirationInfo,
  isExpired,
  isExpiring
} from "../../utils/messages";
import CalendarEventButton from "./CalendarEventButton";
import CalendarIconComponent from "./CalendarIconComponent";
import PaymentButton from "./PaymentButton";
import customVariables from '../../theme/variables';
import {StyleSheet} from "react-native";

type Props = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
  disabled?: boolean;
  paid: boolean;
};

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
  },
});

/**
 * A component to show the action buttons of a message.
 * For messages with the proper configuration renders, on a row:
 * - a calendar icon
 * - a button to add/remove a calendar event
 * - a button to show/start a payment
 */
class MessageListCTABar extends React.PureComponent<Props> {
  get paymentExpirationInfo() {
    const { message } = this.props;
    const { payment_data, due_date } = message.content;
    return fromNullable(payment_data).map(paymentData =>
      getMessagePaymentExpirationInfo(paymentData, due_date)
    );
  };

  get paid(): boolean {
    return this.props.payment !== undefined;
  }

  get isPaymentExpired(){
    return this.paymentExpirationInfo.fold(false, info =>
      isExpired(info)
  )};

  // Evaluate if use 'isExpiring' or 'isToday' (from date-fns) to determe if it is expiring today
  get isPaymentExpiring(){
    return this.paymentExpirationInfo.fold(false, info =>
    isExpiring(info)
  )};

  get dueDate(){
    return this.props.message.content.due_date;
  }
 
  private renderCalendarIcon = () => {
    const { dueDate } = this;

    // The calendar icon is shown if:
    // - the message has a due date
    // - the payment related to the message is not yet paid
    if(dueDate !== undefined && !this.paid){
      const iconBackgoundColor = this.isPaymentExpiring ? customVariables.calendarExpirableColor : customVariables.brandDarkGray;
      return (
        <CalendarIconComponent
          small={true}
          month={capitalize(formatDateAsMonth(dueDate))}
          day={formatDateAsDay(dueDate)}
          backgroundColor={iconBackgoundColor}
          textColor={customVariables.colorWhite}
        />
      )
    }
    return undefined
  };

  // Render a button to add/remove an event related to the message in the calendar
  private renderCalendarEventButton = () => {
    // The add/remove reminder button is shown if:
    // - if the message has a due date
    // - if the message has a payment and it is not paid nor expired
    if (this.dueDate !== undefined && !this.paid && !this.isPaymentExpired) {
      return (
        <CalendarEventButton
          small={true}
          disabled={this.props.disabled}
          message={this.props.message}
        />
      );
    }
    return undefined
  };

  // Render abutton to display details of the payment related to the message
  private renderPaymentButton() {
    const { message, service, paid, disabled } = this.props;

    // The button is displayed if the payment has an expiration date in the future
    if (this.paymentExpirationInfo.isNone()) {
      return undefined;
    }

    return (
      <PaymentButton
        paid={paid}
        messagePaymentExpirationInfo={this.paymentExpirationInfo.value}
        small={true}
        disabled={disabled}
        service={service}
        message={message}
      />
    );
  }

  public render(){
    const calendarIcon = this.renderCalendarIcon();
    const calendarEventButton = this.renderCalendarEventButton();
    return (
        <View
          style={[
            styles.topContainer,
            this.paid && styles.topContainerPaid
          ]}
        >
          {calendarIcon}
          {calendarIcon && <View hspacer={true} small={true} />}
          {calendarEventButton}
          {calendarEventButton && <View hspacer={true} small={true} />}
          {this.renderPaymentButton()}
        </View>
      );
  };   
}

export default MessageListCTABar;
