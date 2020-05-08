import { capitalize } from "lodash";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaidReason } from "../../store/reducers/entities/payments";
import customVariables from "../../theme/variables";
import {
  format,
  formatDateAsDay,
  formatDateAsLocal,
  formatDateAsMonth
} from "../../utils/dates";
import {
  isExpired,
  isExpiring,
  paymentExpirationInfo
} from "../../utils/messages";
import { formatPaymentAmount } from "../../utils/payment";
import StyledIconFont from "../ui/IconFont";
import CalendarIconComponent from "./CalendarIconComponent";

type Props = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
};

const CALENDAR_ICON_HEIGHT = 40;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: customVariables.appHeaderPaddingHorizontal,
    alignItems: "center",
    minHeight:
      CALENDAR_ICON_HEIGHT + 2 * customVariables.appHeaderPaddingHorizontal
  },
  text: {
    flex: 1,
    paddingRight: 60,
    paddingLeft: 5
  },
  highlight: {
    color: customVariables.brandHighlight
  },
  center: {
    justifyContent: "center"
  }
});

/**
 * A component to show detailed info about the due date of a message
 */
class MessageDueDateBar extends React.PureComponent<Props> {
  get paymentExpirationInfo() {
    return paymentExpirationInfo(this.props.message);
  }

  get paid(): boolean {
    return this.props.payment !== undefined;
  }

  get amount() {
    return this.paymentExpirationInfo.fold(undefined, i =>
      formatPaymentAmount(i.amount)
    );
  }

  get isPaymentExpired() {
    return this.paymentExpirationInfo.fold(false, info => isExpired(info));
  }

  get isPaymentExpiring() {
    return this.paymentExpirationInfo.fold(false, info => isExpiring(info));
  }

  get dueDate() {
    return this.props.message.content.due_date;
  }

  get bannerStyle(): ViewStyle {
    if (this.isPaymentExpired) {
      return { backgroundColor: customVariables.brandDarkGray };
    }
    if (this.isPaymentExpiring) {
      return { backgroundColor: customVariables.calendarExpirableColor };
    }
    return { backgroundColor: customVariables.brandGray };
  }

  get textContent() {
    const { dueDate } = this;
    if (!dueDate) {
      return undefined;
    }

    const time = format(dueDate, "HH.mm");
    const date = formatDateAsLocal(dueDate, true, true);

    if (this.isPaymentExpiring) {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.payment.expiringAlert")}
          <Text bold={true} white={true}>{` ${time}`}</Text>
        </React.Fragment>
      );
    }

    if (this.isPaymentExpired) {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.payment.expiredAlert.block1")}
          <Text bold={true} white={true}>{` ${time} `}</Text>
          {I18n.t("messages.cta.payment.expiredAlert.block2")}
          <Text bold={true} white={true}>{` ${date}`}</Text>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {I18n.t("messages.cta.payment.addMemo.block1")}
        <Text bold={true}>{` ${date} `}</Text>
        {I18n.t("messages.cta.payment.addMemo.block2")}
        <Text bold={true}>{` ${time}`}</Text>
      </React.Fragment>
    );
  }

  // The calendar icon is shown if:
  // - the payment related to the message is not yet paid
  // - the message has a due date
  private renderCalendarIcon = () => {
    const { dueDate } = this;

    if (dueDate && !this.paid) {
      const iconBackgoundColor =
        this.isPaymentExpiring || this.isPaymentExpired
          ? customVariables.colorWhite
          : customVariables.brandDarkGray;

      const textColor = this.isPaymentExpiring
        ? customVariables.calendarExpirableColor
        : this.isPaymentExpired
          ? customVariables.brandDarkGray
          : customVariables.colorWhite;

      return (
        <CalendarIconComponent
          month={capitalize(formatDateAsMonth(dueDate))}
          day={formatDateAsDay(dueDate)}
          backgroundColor={iconBackgoundColor}
          textColor={textColor}
        />
      );
    }
    return null;
  };

  /**
   * Display description on message deadlines
   */
  public render() {
    const { dueDate, amount, paid } = this;

    if (dueDate === undefined) {
      return null;
    }

    return (
      <View
        style={[
          styles.container,
          this.bannerStyle,
          paid ? styles.center : undefined
        ]}
      >
        {this.paid ? (
          <React.Fragment>
            <StyledIconFont
              name={"io-tick-big"}
              color={customVariables.brandHighlight}
            />
            <Text style={styles.highlight}>
              {I18n.t("messages.cta.paid", { amount })}
            </Text>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {this.renderCalendarIcon()}
            <View hspacer={true} small={true} />
            <Text
              style={styles.text}
              white={this.isPaymentExpiring || this.isPaymentExpired}
            >
              {this.textContent}
            </Text>
          </React.Fragment>
        )}
      </View>
    );
  }
}

export default MessageDueDateBar;
