// TODO:
// - update with medical prescription due date (if different from the message due date)
// - it shoudn't be optional!!!
// - if due date is different, check what to pass to CalendarEventButton (it is NO more message or check in the component what to check to consider the proper due date)

import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { Text as NBText } from "native-base";
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import {
  format,
  formatDateAsDay,
  formatDateAsLocal,
  formatDateAsMonth,
  getExpireStatus
} from "../../../../utils/dates";
import {
  ExpireStatus,
  getMessagePaymentExpirationInfo
} from "../../../../utils/messages";
import { HSpacer, VSpacer } from "../../../core/spacer/Spacer";
import { IOColors } from "../../../core/variables/IOColors";
import CalendarEventButton from "./CalendarEventButton";
import CalendarIconComponent from "./CalendarIconComponent";

type Props = {
  message: CreatedMessageWithContentAndAttachments;
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
    return pipe(
      payment_data,
      O.fromNullable,
      O.map(paymentData =>
        getMessagePaymentExpirationInfo(paymentData, due_date)
      )
    );
  }

  get dueDate() {
    return O.fromNullable(this.props.message.content.due_date);
  }

  get expirationStatus(): O.Option<ExpireStatus> {
    return pipe(this.dueDate, O.map(getExpireStatus));
  }

  get isPrescriptionExpired() {
    return pipe(
      this.expirationStatus,
      O.fold(
        () => false,
        es => es === "EXPIRED"
      )
    );
  }

  get isPrescriptionExpiring() {
    return pipe(
      this.expirationStatus,
      O.fold(
        () => false,
        es => es === "EXPIRING"
      )
    );
  }

  get bannerStyle(): ViewStyle {
    if (this.isPrescriptionExpired) {
      return { backgroundColor: IOColors.bluegrey };
    }
    return { backgroundColor: IOColors.greyUltraLight };
  }

  get textContent() {
    const { dueDate } = this;
    if (O.isNone(dueDate)) {
      return undefined;
    }
    const date = formatDateAsLocal(dueDate.value, true, true);
    const time = format(dueDate.value, "HH.mm");

    if (this.isPrescriptionExpired) {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.prescription.expiredAlert.block1")}
          <NBText bold={true} white={true}>{` ${time} `}</NBText>
          {I18n.t("messages.cta.prescription.expiredAlert.block2")}
          <NBText bold={true} white={true}>{` ${date}`}</NBText>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.prescription.expiringOrValidAlert.block1")}
          <NBText bold={true} white={false}>{` ${time} `}</NBText>
          {I18n.t("messages.cta.prescription.expiringOrValidAlert.block2")}
          <NBText bold={true} white={false}>{` ${date}`}</NBText>
        </React.Fragment>
      );
    }
  }

  // The calendar icon is shown if:
  // - the payment related to the message is not yet paid
  // - the message has a due date
  private renderCalendarIcon = () => {
    const { dueDate } = this;
    return pipe(
      dueDate,
      O.fold(
        () => null,
        dd => {
          const iconBackgoundColor =
            this.isPrescriptionExpiring || this.isPrescriptionExpired
              ? IOColors.white
              : IOColors.bluegrey;

          const textColor = this.isPrescriptionExpiring
            ? customVariables.calendarExpirableColor
            : this.isPrescriptionExpired
            ? IOColors.bluegrey
            : IOColors.white;

          return (
            <CalendarIconComponent
              month={capitalize(formatDateAsMonth(dd))}
              day={formatDateAsDay(dd)}
              backgroundColor={iconBackgoundColor}
              textColor={textColor}
            />
          );
        }
      )
    );
  };

  /**
   * Display description on prescription expiration
   */
  public render() {
    const { dueDate } = this;
    return pipe(
      dueDate,
      O.fold(
        () => null,
        _ =>
          !this.isPrescriptionExpiring && !this.isPrescriptionExpired ? (
            <View style={[styles.container, this.bannerStyle]}>
              <NBText style={styles.text} white={false}>
                {this.textContent}
              </NBText>
              <VSpacer size={4} />
              <View style={styles.row}>
                {this.renderCalendarIcon()}
                <HSpacer size={8} />
                <CalendarEventButton
                  message={this.props.message}
                  medium={true}
                />
              </View>
            </View>
          ) : (
            <View style={[styles.container, styles.row, this.bannerStyle]}>
              {this.renderCalendarIcon()}
              <HSpacer size={8} />
              <NBText style={styles.text} white={true}>
                {this.textContent}
              </NBText>
            </View>
          )
      )
    );
  }
}

export default MedicalPrescriptionDueDateBar;
