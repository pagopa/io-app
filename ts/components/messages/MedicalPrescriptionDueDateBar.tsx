// TODO:
// - update with medical prescription due date (if different from the message due date)
// - it shoudn't be optional!!!
// - if due date is different, check what to pass to CalendarEventButton (it is NO more message or check in the component what to check to consider the proper due date)

import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import {
  format,
  formatDateAsDay,
  formatDateAsLocal,
  formatDateAsMonth,
  getExpireStatus
} from "../../utils/dates";
import {
  ExpireStatus,
  getMessagePaymentExpirationInfo
} from "../../utils/messages";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import CalendarEventButton from "./CalendarEventButton";
import CalendarIconComponent from "./CalendarIconComponent";

type Props = {
  message: CreatedMessageWithContentAndAttachments;
  service?: ServicePublic;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: customVariables.appHeaderPaddingHorizontal
  },
  text: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  }
});

/**
 * A component to show detailed info about the due date of a prescription.It has 3 representation styles:
 * - if the duedate is whitin the next 24 hours, it is a dark gray banner alerting about it,
 * - if the due date is in the past , it is a red banner alerting about it,
 * - otherwise, is is a light gray banner with a button to add a reminder
 */
class MedicalPrescriptionDueDateBar extends React.PureComponent<Props> {
  get paymentExpirationInfo() {
    const { message } = this.props;
    const { payment_data, due_date } = message.content;
    return fromNullable(payment_data).map(paymentData =>
      getMessagePaymentExpirationInfo(paymentData, due_date)
    );
  }

  get dueDate() {
    return fromNullable(this.props.message.content.due_date);
  }

  get expirationStatus(): Option<ExpireStatus> {
    return this.dueDate.fold(none, d => some(getExpireStatus(d)));
  }

  get isPrescriptionExpired() {
    return this.expirationStatus.fold(false, es => es === "EXPIRED");
  }

  get isPrescriptionExpiring() {
    return this.expirationStatus.fold(false, es => es === "EXPIRING");
  }

  get bannerStyle(): ViewStyle {
    if (this.isPrescriptionExpired) {
      return { backgroundColor: customVariables.brandDarkGray };
    }
    if (this.isPrescriptionExpiring) {
      return { backgroundColor: customVariables.calendarExpirableColor };
    }
    return { backgroundColor: customVariables.brandGray };
  }

  get textContent() {
    const { dueDate } = this;
    if (dueDate.isNone()) {
      return undefined;
    }
    const date = formatDateAsLocal(dueDate.value, true, true);
    const time = format(dueDate.value, "HH.mm");
    if (this.isPrescriptionExpiring) {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.prescription.expiringAlert")}
        </React.Fragment>
      );
    }

    if (this.isPrescriptionExpired) {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.prescription.expiredAlert.block1")}
          <Text bold={true} white={true}>{` ${time} `}</Text>
          {I18n.t("messages.cta.prescription.expiredAlert.block2")}
          <Text bold={true} white={true}>{` ${date}`}</Text>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {I18n.t("messages.cta.prescription.addMemo")}
        <Text bold={true}>{` ${date}`}</Text>
      </React.Fragment>
    );
  }

  // The calendar icon is shown if:
  // - the payment related to the message is not yet paid
  // - the message has a due date
  private renderCalendarIcon = () => {
    const { dueDate } = this;
    return dueDate.fold(null, dd => {
      const iconBackgoundColor =
        this.isPrescriptionExpiring || this.isPrescriptionExpired
          ? customVariables.colorWhite
          : customVariables.brandDarkGray;

      const textColor = this.isPrescriptionExpiring
        ? customVariables.calendarExpirableColor
        : this.isPrescriptionExpired
        ? customVariables.brandDarkGray
        : customVariables.colorWhite;

      return (
        <CalendarIconComponent
          month={capitalize(formatDateAsMonth(dd))}
          day={formatDateAsDay(dd)}
          backgroundColor={iconBackgoundColor}
          textColor={textColor}
        />
      );
    });
  };

  /**
   * Display description on prescription expiration
   */
  public render() {
    const { dueDate } = this;
    return dueDate.fold(null, _ =>
      !this.isPrescriptionExpiring && !this.isPrescriptionExpired ? (
        <View style={[styles.container, this.bannerStyle]}>
          <Text style={styles.text} white={false}>
            {this.textContent}
          </Text>
          <View spacer={true} xsmall={true} />
          <View style={styles.row}>
            {this.renderCalendarIcon()}
            <View hspacer={true} small={true} />
            <CalendarEventButton message={this.props.message} medium={true} />
          </View>
        </View>
      ) : (
        <View style={[styles.container, styles.row, this.bannerStyle]}>
          {this.renderCalendarIcon()}
          <View hspacer={true} small={true} />
          <Text style={styles.text} white={true}>
            {this.textContent}
          </Text>
        </View>
      )
    );
  }
}

export default MedicalPrescriptionDueDateBar;
