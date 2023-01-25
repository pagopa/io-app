import { capitalize } from "lodash";
import React from "react";
import { View, StyleSheet } from "react-native";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { formatDateAsDay, formatDateAsMonth } from "../../../utils/dates";
import {
  isExpired,
  MessagePaymentExpirationInfo
} from "../../../utils/messages";
import { UIMessageDetails } from "../../../store/reducers/entities/messages/types";
import { IOColors } from "../../core/variables/IOColors";
import { localeDateFormat } from "../../../utils/locale";
import { HSpacer, VSpacer } from "../../core/spacer/Spacer";
import { IOStyles } from "../../core/variables/IOStyles";
import { Label } from "../../core/typography/Label";
import CalendarIconComponent from "./common/CalendarIconComponent";
import CalendarEventButton from "./common/CalendarEventButton";

type Props = {
  dueDate: Date;

  messageDetails: UIMessageDetails;

  /* A message can carry both medical data and a payment */
  paymentExpirationInfo?: MessagePaymentExpirationInfo;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: customVariables.appHeaderPaddingHorizontal
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
  const time = localeDateFormat(
    dueDate,
    I18n.t("global.dateFormats.timeFormat")
  );
  const date = localeDateFormat(
    dueDate,
    I18n.t("global.dateFormats.shortFormat")
  );

  const bannerStyle = isPrescriptionExpired
    ? { backgroundColor: IOColors.bluegrey }
    : { backgroundColor: IOColors.greyUltraLight };

  if (isPrescriptionExpired) {
    return (
      <View
        testID={"MedicalPrescriptionDueDate_expired"}
        style={[
          styles.container,
          IOStyles.horizontalContentPadding,
          IOStyles.row,
          IOStyles.alignCenter,
          bannerStyle
        ]}
      >
        <CalendarIconComponent
          month={capitalize(formatDateAsMonth(dueDate))}
          day={formatDateAsDay(dueDate)}
          backgroundColor={IOColors.white}
          textColor={IOColors.bluegrey}
        />

        <HSpacer size={8} />
        <View style={IOStyles.flex}>
          <Label weight="Bold" color="white">
            <>
              {I18n.t("messages.cta.prescription.expiredAlert.block1")}
              <Label weight="Bold" color="white">{` ${date} `}</Label>
              {I18n.t("messages.cta.prescription.expiredAlert.block2")}
              <Label weight="Bold" color="white">{` ${time}`}</Label>
            </>
          </Label>
        </View>
      </View>
    );
  }

  return (
    <View
      testID={"MedicalPrescriptionDueDate_valid"}
      style={[styles.container, IOStyles.horizontalContentPadding, bannerStyle]}
    >
      <View style={IOStyles.flex}>
        <Label weight="Bold" color="white">
          <>
            {I18n.t("messages.cta.prescription.expiringOrValidAlert.block1")}
            <Label weight="Bold">{` ${date} `}</Label>
            {I18n.t("messages.cta.prescription.expiringOrValidAlert.block2")}
            <Label weight="Bold">{` ${time}`}</Label>
          </>
        </Label>
      </View>
      <VSpacer size={4} />
      <View style={[IOStyles.row, IOStyles.alignCenter]}>
        <CalendarIconComponent
          month={capitalize(formatDateAsMonth(dueDate))}
          day={formatDateAsDay(dueDate)}
          backgroundColor={IOColors.bluegrey}
          textColor={IOColors.white}
        />
        <HSpacer size={8} />
        <CalendarEventButton message={messageDetails.raw} medium={true} />
      </View>
    </View>
  );
};

export default MedicalPrescriptionDueDateBar;
