import { isToday } from "date-fns";
import { fromNullable } from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaidReason } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import { format, formatDateAsDay, formatDateAsMonth } from "../../utils/dates";
import {
  getMessagePaymentExpirationInfo,
  isExpirable,
  isExpired,
  isExpiring
} from "../../utils/messages";
import { formatPaymentAmount } from "../../utils/payment";
import StyledIconFont from "../ui/IconFont";
import CalendarEventButton from "./CalendarEventButton";
import CalendarIconComponent from "./CalendarIconComponent";
import PaymentButton from "./PaymentButton";

type Props = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
  small?: boolean;
  disabled?: boolean;
};

const styles = StyleSheet.create({
  topContainer: {
    display: "flex",
    flexDirection: "row"
  },
  topContainerLarge: {
    paddingVertical: variables.contentPadding / 2,
    paddingHorizontal: variables.contentPadding,
    backgroundColor: variables.brandGray
  },
  topContainerPaid: {
    paddingVertical: 0,
    paddingHorizontal: 0
  },
  bottomContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: variables.contentPadding / 2,
    paddingHorizontal: variables.contentPadding
  },
  bottomContainerValid: {
    backgroundColor: variables.brandGray
  },
  bottomContainerExpiring: {
    backgroundColor: "#D0021B"
  },
  bottomContainerExpired: {
    backgroundColor: variables.brandDarkGray
  },
  bottomContainerText: {
    flex: 1,
    flexWrap: "wrap",
    marginLeft: 16
  }
});

/**
 * A component to show the action buttons on a message.
 * For messages with the proper configuration, the user can:
 * - add a message-related calendar event
 * - start the message-related payment
 */
class MessageCTABar extends React.PureComponent<Props> {
  get paid(): boolean {
    return this.props.payment !== undefined;
  }

  get paymentExpirationInfo() {
    const { message } = this.props;
    const { payment_data, due_date } = message.content;
    return fromNullable(payment_data).map(paymentData =>
      getMessagePaymentExpirationInfo(paymentData, due_date)
    );
  }

  private isPaymentExpired = this.paymentExpirationInfo.fold(false, info =>
    isExpired(info)
  );
  private isPaymentExpiring = this.paymentExpirationInfo.fold(false, info =>
    isExpiring(info)
  );

  private renderCalendarIcon = () => {
    const { message, small } = this.props;
    const { due_date } = message.content;

    // The calendar icon is hidden if:
    // - the payment related to the message has been paid
    if (this.paid) {
      return undefined;
    }

    // - the message has any a due date
    if (!due_date) {
      return undefined;
    }

    return (
      <CalendarIconComponent
        small={small}
        month={capitalize(formatDateAsMonth(due_date))}
        day={formatDateAsDay(due_date)}
        backgroundColor={
          this.isPaymentExpiring
            ? variables.calendarExpirableColor
            : variables.brandDarkGray
        }
        textColor={variables.colorWhite}
      />
    );
  };

  // Render a button to add/remove an event related to the message in the calendar
  private renderCalendarEventButton = () => {
    const { message } = this.props;
    const { due_date } = message.content;

    // The add/remove reminder button is hidden if:
    // - if the message has a due date
    if (due_date === undefined) {
      return undefined;
    }

    // - if the message is relative to a payment and it has been paid
    if (this.paid) {
      return undefined;
    }

    // - the payment related to the message expired
    if (this.isPaymentExpired) {
      return undefined;
    }

    const { small, disabled } = this.props;
    return (
      <CalendarEventButton
        small={small}
        disabled={disabled}
        message={this.props.message}
      />
    );
  };

  // Render a button to display details of the payment related to the message
  private renderPaymentButton() {
    const { message, service, small, disabled } = this.props;

    const paymentInfo = this.paymentExpirationInfo;

    // don't show payment button if the message doesn't contain payment info or
    // the payment is expired and it has to be rendered in the large version
    if (paymentInfo.isNone() || (!small && this.isPaymentExpired)) {
      return undefined;
    }

    const messagePaymentExpirationInfo = paymentInfo.value;

    return (
      <PaymentButton
        paid={this.paid}
        messagePaymentExpirationInfo={messagePaymentExpirationInfo}
        small={small}
        disabled={disabled}
        service={service}
        message={message}
      />
    );
  }

  /**
   * Render on a row, if available:
   * - a calendar icon
   * - a button to add/remove a calendar event
   * - a button to show/start a payment
   */
  private renderTopContainer = () => {
    const { small } = this.props;

    if (!small && this.isPaymentExpired) {
      return undefined;
    }

    const calendarIcon = this.renderCalendarIcon();
    const calendarEventButton = this.renderCalendarEventButton();
    const paymentButton = this.renderPaymentButton();
    if (
      calendarIcon !== null ||
      calendarEventButton !== null ||
      paymentButton !== null
    ) {
      return (
        <View
          style={[
            styles.topContainer,
            this.paid ? styles.topContainerPaid : undefined,
            !small && styles.topContainerLarge
          ]}
        >
          {calendarIcon}
          {calendarIcon && <View hspacer={true} small={true} />}

          {calendarEventButton}
          {calendarEventButton && <View hspacer={true} small={true} />}

          {paymentButton}
        </View>
      );
    }

    return null;
  };

  /**
   * Display description on message deadlines
   */
  private renderBottomContainer = () => {
    const { small } = this.props;

    // If in the message detail and the payment is not expired
    if (
      !small &&
      this.paymentExpirationInfo.isSome() &&
      isExpirable(this.paymentExpirationInfo.value)
    ) {
      const messagePaymentExpirationInfo = this.paymentExpirationInfo.value;

      const dueDate = messagePaymentExpirationInfo.dueDate;

      if (messagePaymentExpirationInfo.expireStatus === "VALID") {
        const time = format(dueDate, "HH.mm");
        const day = format(dueDate, I18n.t("global.dateFormats.dayMonthYear"));

        const block1 = I18n.t("messages.cta.payment.validAlert.block1");
        const block2 = I18n.t("messages.cta.payment.validAlert.block2", {
          time,
          day
        });

        return (
          <View style={[styles.bottomContainer, styles.bottomContainerValid]}>
            <StyledIconFont name="io-timer" size={24} />
            <Text style={styles.bottomContainerText}>
              {block1} <Text bold={true}>{block2}</Text>
            </Text>
          </View>
        );
      } else if (messagePaymentExpirationInfo.expireStatus === "EXPIRING") {
        const time = format(dueDate, "HH.mm");
        const todayOrTomorrow = isToday(dueDate)
          ? I18n.t("global.date.today")
          : I18n.t("global.date.tomorrow");

        const block1 = I18n.t("messages.cta.payment.expiringAlert.block1");
        const block2 = I18n.t("messages.cta.payment.expiringAlert.block2", {
          todayOrTomorrow
        });
        const block3 = I18n.t("messages.cta.payment.expiringAlert.block3");

        return (
          <View
            style={[styles.bottomContainer, styles.bottomContainerExpiring]}
          >
            <StyledIconFont
              name="io-timer"
              size={24}
              color={variables.colorWhite}
            />
            <Text white={true} style={styles.bottomContainerText}>
              {block1}{" "}
              <Text white={true} bold={true}>
                {block2}
              </Text>{" "}
              {block3}{" "}
              <Text white={true} bold={true}>
                {time}
              </Text>
            </Text>
          </View>
        );
      } else {
        const time = format(dueDate, "HH.mm");
        const day = format(dueDate, I18n.t("global.dateFormats.dayMonthYear"));
        const amount = formatPaymentAmount(messagePaymentExpirationInfo.amount);

        const block1 = I18n.t("messages.cta.payment.expiredAlert.block1");
        const block2 = I18n.t("messages.cta.payment.expiredAlert.block2", {
          amount
        });
        const block3 = I18n.t("messages.cta.payment.expiredAlert.block3");
        const block4 = I18n.t("messages.cta.payment.expiredAlert.block4");
        const block5 = I18n.t("messages.cta.payment.expiredAlert.block5");
        const block6 = I18n.t("messages.cta.payment.expiredAlert.block6");

        return (
          <View style={[styles.bottomContainer, styles.bottomContainerExpired]}>
            <CalendarIconComponent
              small={this.props.small}
              month={formatDateAsMonth(dueDate).toUpperCase()}
              day={formatDateAsDay(dueDate)}
              backgroundColor={variables.colorWhite}
              textColor={variables.brandDarkGray}
            />
            <Text white={true} style={styles.bottomContainerText}>
              {block1}{" "}
              <Text white={true} bold={true}>
                {block2}
              </Text>{" "}
              {block3}{" "}
              <Text white={true} bold={true}>
                {block4}
              </Text>{" "}
              {block5}{" "}
              <Text white={true} bold={true}>
                {time}
              </Text>{" "}
              {block6}{" "}
              <Text white={true} bold={true}>
                {day}
              </Text>
            </Text>
          </View>
        );
      }
    }

    return null;
  };

  public render() {
    return (
      <React.Fragment>
        {this.renderTopContainer()}
        {this.renderBottomContainer()}
      </React.Fragment>
    );
  }
}

export default MessageCTABar;
