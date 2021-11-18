import { capitalize } from "lodash";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";

import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import variables from "../../../../theme/variables";
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
import IconFont from "../../../ui/IconFont";
import { IOColors } from "../../../core/variables/IOColors";
import { Link } from "../../../core/typography/Link";

import CalendarIconComponent from "../../CalendarIconComponent";

type Props = {
  dueDate: Date;
  expirationInfo: MessagePaymentExpirationInfo;
  isPaid: boolean;
  onGoToWallet: () => void;
};

type PaymentStatus = "paid" | "expiring" | "expired" | "valid";

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
    paddingRight: 50,
    paddingLeft: 5
  },
  highlight: {
    color: customVariables.brandHighlight
  },
  center: {
    justifyContent: "center"
  },
  padded: {
    paddingHorizontal: variables.contentPadding
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
}> = ({ status, dueDate, onPaidPress }) => {
  const time = format(dueDate, "HH:mm");
  const date = formatDateAsLocal(dueDate, true, true);
  switch (status) {
    case "paid":
      return (
        <>
          {`${I18n.t("messages.cta.payment.paid")} `}
          <Link onPress={onPaidPress}>{I18n.t("wallet.wallet")}</Link>
        </>
      );
    case "expired":
      return (
        <>
          {I18n.t("messages.cta.payment.expiredAlert.block1")}
          <Text bold={true} white={true}>{` ${time} `}</Text>
          {I18n.t("messages.cta.payment.expiredAlert.block2")}
          <Text bold={true} white={true}>{` ${date}`}</Text>
        </>
      );
    case "valid":
    case "expiring":
      return (
        <>
          {I18n.t("messages.cta.payment.expiringOrValidAlert.block1")}
          <Text bold={true}>{` ${date} `}</Text>
        </>
      );
  }
};

const getCalendarIconBackgroundColor = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
      return customVariables.lighterGray;
    case "expired":
      return customVariables.colorWhite;
    case "expiring":
    case "valid":
      return customVariables.brandDarkGray;
  }
};

const getCalendarTextColor = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
    case "expiring":
    case "valid":
      return customVariables.colorWhite;
    case "expired":
      return customVariables.brandDarkGray;
  }
};

// The calendar icon is shown if:
// - the payment related to the message is not yet paid
// - the message has a due date
const CalendarIcon: React.FunctionComponent<{
  status: PaymentStatus;
  dueDate: Date;
}> = ({ status, dueDate }) => {
  const iconBackgoundColor = getCalendarIconBackgroundColor(status);

  const textColor = getCalendarTextColor(status);

  return (
    <CalendarIconComponent
      month={capitalize(formatDateAsMonth(dueDate))}
      day={formatDateAsDay(dueDate)}
      backgroundColor={iconBackgoundColor}
      textColor={textColor}
    />
  );
};

const bannerStyle = (status: PaymentStatus): ViewStyle => {
  switch (status) {
    case "paid":
    case "expiring":
    case "valid":
      return { backgroundColor: customVariables.brandGray };
    case "expired":
      return { backgroundColor: customVariables.brandDarkGray };
  }
};

const calculatePaymentStatus = (
  isPaid: boolean,
  expirationInfo: MessagePaymentExpirationInfo
): PaymentStatus => {
  if (isPaid) {
    return "paid";
  }
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
  isPaid,
  onGoToWallet
}) => {
  const paymentStatus = calculatePaymentStatus(isPaid, expirationInfo);
  if (paymentStatus === "paid") {
    return (
      <View style={styles.messagePaidBg}>
        <IconFont name="io-complete" color={IOColors.bluegreyDark} />
        <Text style={[styles.padded, { color: IOColors.bluegreyDark }]}>
          {I18n.t("wallet.errors.DUPLICATED")}
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, bannerStyle(paymentStatus)]}>
        <>
          <CalendarIcon status={paymentStatus} dueDate={dueDate} />
          <View hspacer={true} small={true} />

          <Text style={styles.text} white={paymentStatus === "expired"}>
            <TextContent
              status={paymentStatus}
              dueDate={dueDate}
              onPaidPress={onGoToWallet}
            />
          </Text>
        </>
      </View>
      <View spacer={true} large={true} />
    </>
  );
};

export default DueDateBar;
