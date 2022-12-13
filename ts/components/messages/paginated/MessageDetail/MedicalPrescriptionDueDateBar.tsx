import { capitalize } from "lodash";
import { Text as NBText, View } from "native-base";
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
  MessagePaymentExpirationInfo
} from "../../../../utils/messages";
import { UIMessageDetails } from "../../../../store/reducers/entities/messages/types";
import CalendarIconComponent from "../../CalendarIconComponent";
import CalendarEventButton from "../../CalendarEventButton";
import { IOColors } from "../../../core/variables/IOColors";

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
  const date = formatDateAsLocal(dueDate, true, true);
  const time = format(dueDate, "HH.mm");

  const bannerStyle = isPrescriptionExpired
    ? { backgroundColor: IOColors.bluegrey }
    : { backgroundColor: IOColors.greyUltraLight };

  if (isPrescriptionExpired) {
    return (
      <View
        testID={"MedicalPrescriptionDueDate_expired"}
        style={[styles.container, styles.row, bannerStyle]}
      >
        <CalendarIconComponent
          month={capitalize(formatDateAsMonth(dueDate))}
          day={formatDateAsDay(dueDate)}
          backgroundColor={IOColors.white}
          textColor={IOColors.bluegrey}
        />

        <View hspacer={true} small={true} />
        <NBText style={styles.text} white={true}>
          <>
            {I18n.t("messages.cta.prescription.expiredAlert.block1")}
            <NBText bold={true} white={true}>{` ${date} `}</NBText>
            {I18n.t("messages.cta.prescription.expiredAlert.block2")}
            <NBText bold={true} white={true}>{` ${time}`}</NBText>
          </>
        </NBText>
      </View>
    );
  }

  return (
    <View
      testID={"MedicalPrescriptionDueDate_valid"}
      style={[styles.container, bannerStyle]}
    >
      <NBText style={styles.text} white={false}>
        <>
          {I18n.t("messages.cta.prescription.expiringOrValidAlert.block1")}
          <NBText bold={true} white={false}>{` ${date} `}</NBText>
          {I18n.t("messages.cta.prescription.expiringOrValidAlert.block2")}
          <NBText bold={true} white={false}>{` ${time}`}</NBText>
        </>
      </NBText>
      <View spacer={true} xsmall={true} />
      <View style={styles.row}>
        <CalendarIconComponent
          month={capitalize(formatDateAsMonth(dueDate))}
          day={formatDateAsDay(dueDate)}
          backgroundColor={IOColors.bluegrey}
          textColor={IOColors.white}
        />
        <View hspacer={true} small={true} />
        <CalendarEventButton message={messageDetails.raw} medium={true} />
      </View>
    </View>
  );
};

export default MedicalPrescriptionDueDateBar;
