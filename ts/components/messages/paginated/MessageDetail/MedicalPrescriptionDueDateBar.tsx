import { capitalize } from "lodash";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import {
  format,
  formatDateAsDay,
  formatDateAsLocal,
  formatDateAsMonth
} from "../../../../utils/dates";
import {
  isExpired,
  isExpiring,
  MessagePaymentExpirationInfo
} from "../../../../utils/messages";
import CalendarIconComponent from "../../CalendarIconComponent";

type Props = {
  dueDate: Date;
  paymentExpirationInfo: MessagePaymentExpirationInfo;
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
 *
 * TODO:
 * - update with medical prescription due date (if different from the message due date)
 * - if due date is different, check what to pass to CalendarEventButton
 *      (it is NO more message or check in the component what to check to consider the proper due date)
 */
const MedicalPrescriptionDueDateBar = ({
  paymentExpirationInfo,
  dueDate
}: Props) => {
  const isPrescriptionExpired = isExpired(paymentExpirationInfo);
  const isPrescriptionExpiring = isExpiring(paymentExpirationInfo);

  const date = formatDateAsLocal(dueDate, true, true);
  const time = format(dueDate, "HH.mm");

  const bannerStyle = isPrescriptionExpired
    ? { backgroundColor: customVariables.brandDarkGray }
    : isPrescriptionExpiring
    ? { backgroundColor: customVariables.calendarExpirableColor }
    : { backgroundColor: customVariables.brandGray };

  if (isPrescriptionExpiring || isPrescriptionExpired) {
    return (
      <View style={[styles.container, styles.row, bannerStyle]}>
        <CalendarIconComponent
          month={capitalize(formatDateAsMonth(dueDate))}
          day={formatDateAsDay(dueDate)}
          backgroundColor={customVariables.colorWhite}
          textColor={
            isPrescriptionExpiring
              ? customVariables.calendarExpirableColor
              : customVariables.brandDarkGray
          }
        />

        <View hspacer={true} small={true} />
        <Text style={styles.text} white={true}>
          {isPrescriptionExpiring &&
            I18n.t("messages.cta.prescription.expiringAlert")}
          {isPrescriptionExpired && (
            <>
              {I18n.t("messages.cta.prescription.expiredAlert.block1")}
              <Text bold={true} white={true}>{` ${time} `}</Text>
              {I18n.t("messages.cta.prescription.expiredAlert.block2")}
              <Text bold={true} white={true}>{` ${date}`}</Text>
            </>
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, bannerStyle]}>
      <Text style={styles.text} white={false}>
        {I18n.t("messages.cta.prescription.addMemo")}
        <Text bold={true}>{` ${date}`}</Text>
      </Text>
      <View spacer={true} xsmall={true} />
      <View style={styles.row}>
        <CalendarIconComponent
          month={capitalize(formatDateAsMonth(dueDate))}
          day={formatDateAsDay(dueDate)}
          backgroundColor={customVariables.brandDarkGray}
          textColor={customVariables.colorWhite}
        />
        <View hspacer={true} small={true} />
        {/* TODO: https://pagopa.atlassian.net/browse/IA-461
            <CalendarEventButton message={this.props.message} medium={true} />
            */}
      </View>
    </View>
  );
};

export default MedicalPrescriptionDueDateBar;
