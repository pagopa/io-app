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
import { UIMessageDetails } from "../../../../store/reducers/entities/messages/types";
import CalendarIconComponent from "../../CalendarIconComponent";
import CalendarEventButton from "../../CalendarEventButton";

type Props = {
  dueDate: Date;

  messageDetails: UIMessageDetails;

  /* A message can carry both medical data and a payment */
  paymentExpirationInfo?: MessagePaymentExpirationInfo;
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
 * Show detailed info about the due date of a prescription.
 * Note that payment-related data is used to infer a due date and its 'expire status'.
 *
 * TODO:
 * - update with medical prescription due date (if different from the message due date)
 * - if due date is different, check what to pass to CalendarEventButton
 */
const MedicalPrescriptionDueDateBar = ({
  dueDate,
  messageDetails,
  paymentExpirationInfo
}: Props) => {
  const isPrescriptionExpired = paymentExpirationInfo
    ? isExpired(paymentExpirationInfo)
    : false;
  const isPrescriptionExpiring = paymentExpirationInfo
    ? isExpiring(paymentExpirationInfo)
    : false;

  const date = formatDateAsLocal(dueDate, true, true);
  const time = format(dueDate, "HH.mm");

  const bannerStyle = isPrescriptionExpired
    ? { backgroundColor: customVariables.brandDarkGray }
    : isPrescriptionExpiring
    ? { backgroundColor: customVariables.calendarExpirableColor }
    : { backgroundColor: customVariables.brandGray };

  if (isPrescriptionExpiring || isPrescriptionExpired) {
    return (
      <View
        testID={"MedicalPrescriptionDueDate_expired_or_expiring"}
        style={[styles.container, styles.row, bannerStyle]}
      >
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
    <View
      testID={"MedicalPrescriptionDueDate_valid"}
      style={[styles.container, bannerStyle]}
    >
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
        <CalendarEventButton message={messageDetails.raw} medium={true} />
      </View>
    </View>
  );
};

export default MedicalPrescriptionDueDateBar;
