import { capitalize } from "lodash";
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

import I18n from "../../../i18n";
import { navigateToWalletHome } from "../../../store/actions/navigation";
import customVariables from "../../../theme/variables";
import { formatDateAsDay, formatDateAsMonth } from "../../../utils/dates";
import {
  isExpired,
  isExpiring,
  MessagePaymentExpirationInfo
} from "../../../utils/messages";
import { IOColors } from "../../core/variables/IOColors";
import { localeDateFormat } from "../../../utils/locale";
import { HSpacer, VSpacer } from "../../core/spacer/Spacer";
import { Icon } from "../../core/icons";
import { Body } from "../../core/typography/Body";
import { IOStyles } from "../../core/variables/IOStyles";
import CalendarIconComponent from "./common/CalendarIconComponent";

type Props = {
  dueDate: Date;
  expirationInfo: MessagePaymentExpirationInfo;
  isPaid: boolean;
};

type PaymentStatus = "expiring" | "expired" | "valid";

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
  textContainer: {
    paddingHorizontal: 4
  },
  messagePaidBg: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: IOColors.aqua
  }
});

const TextContent: React.FunctionComponent<{
  status: PaymentStatus;
  dueDate: Date;
  onPaidPress: () => void;
}> = ({ status, dueDate }) => {
  const time = localeDateFormat(
    dueDate,
    I18n.t("global.dateFormats.timeFormat")
  );
  const date = localeDateFormat(
    dueDate,
    I18n.t("global.dateFormats.shortFormat")
  );
  switch (status) {
    case "expired":
      return (
        <>
          {I18n.t("messages.cta.payment.expiredAlert.block1")}
          <Body weight="SemiBold" color="white">{` ${date} `}</Body>
          {I18n.t("messages.cta.payment.expiredAlert.block2")}
          <Body weight="SemiBold" color="white">{` ${time}`}</Body>
        </>
      );
    case "valid":
    case "expiring":
      return (
        <>
          {I18n.t("messages.cta.payment.expiringOrValidAlert.block1")}
          <Body weight="SemiBold">{` ${date} `}</Body>
          {I18n.t("messages.cta.payment.expiringOrValidAlert.block2")}
          <Body weight="SemiBold">{` ${time}`}</Body>
        </>
      );
  }
};

const getCalendarIconBackgroundColor = (status: PaymentStatus) => {
  switch (status) {
    case "expired":
      return IOColors.white;
    case "expiring":
    case "valid":
      return IOColors.bluegrey;
  }
};

const getCalendarTextColor = (status: PaymentStatus) => {
  switch (status) {
    case "expiring":
    case "valid":
      return IOColors.white;
    case "expired":
      return IOColors.bluegrey;
  }
};

/**
 * - the payment related to the message is not yet paid
 * - the message has a due date
 */
const CalendarIcon: React.FunctionComponent<{
  status: PaymentStatus;
  dueDate: Date;
}> = ({ status, dueDate }) => {
  const iconBackgroundColor = getCalendarIconBackgroundColor(status);

  const textColor = getCalendarTextColor(status);

  return (
    <CalendarIconComponent
      month={capitalize(formatDateAsMonth(dueDate))}
      day={formatDateAsDay(dueDate)}
      backgroundColor={iconBackgroundColor}
      textColor={textColor}
    />
  );
};

const bannerStyle = (status: PaymentStatus): ViewStyle => {
  switch (status) {
    case "expiring":
    case "valid":
      return { backgroundColor: IOColors.greyUltraLight };
    case "expired":
      return { backgroundColor: IOColors.bluegrey };
  }
};

const calculatePaymentStatus = (
  expirationInfo: MessagePaymentExpirationInfo
): PaymentStatus => {
  if (isExpired(expirationInfo)) {
    return "expired";
  }
  if (isExpiring(expirationInfo)) {
    return "expiring";
  }
  return "valid";
};

/**
 * A component to show detailed info about the due date of a message
 */
const DueDateBar: React.FunctionComponent<Props> = ({
  dueDate,
  expirationInfo,
  isPaid
}) => {
  if (isPaid) {
    return (
      <View style={styles.messagePaidBg}>
        <Icon name="ok" color="bluegreyDark" />
        <View style={IOStyles.horizontalContentPadding}>
          <Body color="bluegreyDark">{I18n.t("wallet.errors.DUPLICATED")}</Body>
        </View>
      </View>
    );
  }

  const paymentStatus = calculatePaymentStatus(expirationInfo);

  return (
    <>
      <View style={[styles.container, bannerStyle(paymentStatus)]}>
        <CalendarIcon status={paymentStatus} dueDate={dueDate} />
        <HSpacer size={8} />
        <View style={[styles.textContainer, IOStyles.flex]}>
          <Body
            color={paymentStatus === "expired" ? "white" : "bluegrey"}
            testID={"DueDateBar_TextContent"}
          >
            <TextContent
              status={paymentStatus}
              dueDate={dueDate}
              onPaidPress={() => navigateToWalletHome()}
            />
          </Body>
        </View>
      </View>
      <VSpacer size={24} />
    </>
  );
};

export default DueDateBar;
