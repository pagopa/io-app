import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { navigateToWalletHome } from "../../store/actions/navigation";
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
import { Link } from "../core/typography/Link";
import { IOColors } from "../core/variables/IOColors";
import IconFont from "../ui/IconFont";
import CalendarIconComponent from "./CalendarIconComponent";

type OwnProps = {
  message: CreatedMessageWithContentAndAttachments;
  service?: ServicePublic;
  payment?: PaidReason;
};

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

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
    color: customVariables.colorHighlight
  },
  center: {
    justifyContent: "center"
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  messagePaidBg: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: IOColors.aqua
  }
});

// Every possible state of the payment has it's component
const PaidTextContent: React.FunctionComponent<{
  onPress: () => void;
}> = ({ onPress }) => (
  <>
    {`${I18n.t("messages.cta.payment.paid")} `}
    <Link onPress={onPress}>{I18n.t("wallet.wallet")}</Link>
  </>
);

const ValidOrExpiringTextContent: React.FunctionComponent<{
  date: string;
}> = ({ date }) => (
  <>
    {I18n.t("messages.cta.payment.expiringOrValidAlert.block1")}
    <Text bold={true}>{` ${date} `}</Text>
  </>
);

const Expired: React.FunctionComponent<{
  time: string;
  date: string;
}> = ({ time, date }) => (
  <>
    {I18n.t("messages.cta.payment.expiredAlert.block1")}
    <Text bold={true} white={true}>{` ${time} `}</Text>
    {I18n.t("messages.cta.payment.expiredAlert.block2")}
    <Text bold={true} white={true}>{` ${date}`}</Text>
  </>
);

const TextContent: React.FunctionComponent<{
  status: PaymentStatus;
  dueDate: Date;
  onPaidPress: () => void;
}> = ({ status, dueDate, onPaidPress }) => {
  const time = format(dueDate, "HH:mm");
  const date = formatDateAsLocal(dueDate, true, true);
  switch (status) {
    case "paid":
      return <PaidTextContent onPress={onPaidPress} />;
    case "expired":
      return <Expired time={time} date={date} />;
    case "valid":
    case "expiring":
      return <ValidOrExpiringTextContent date={date} />;
  }
};

const getCalendarIconBackgoundColor = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
      return IOColors.bluegreyLight;
    case "expired":
      return IOColors.white;
    case "expiring":
    case "valid":
      return IOColors.bluegrey;
  }
};

const getCalendarTextColor = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
    case "expiring":
    case "valid":
      return IOColors.white;
    case "expired":
      return IOColors.bluegrey;
  }
};

// The calendar icon is shown if:
// - the payment related to the message is not yet paid
// - the message has a due date
const CalendarIcon: React.FunctionComponent<{
  status: PaymentStatus;
  dueDate: Date;
}> = ({ status, dueDate }) => {
  const iconBackgoundColor = getCalendarIconBackgoundColor(status);

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
      return { backgroundColor: IOColors.greyUltraLight };
    case "expired":
      return { backgroundColor: IOColors.bluegrey };
  }
};

const isPaymentExpired = (
  message: CreatedMessageWithContentAndAttachments
): boolean =>
  pipe(
    paymentExpirationInfo(message),
    O.fold(() => false, isExpired)
  );

const isPaymentExpiring = (
  message: CreatedMessageWithContentAndAttachments
): boolean =>
  pipe(
    paymentExpirationInfo(message),
    O.fold(() => false, isExpiring)
  );

const paid = (payment: PaidReason | undefined): boolean =>
  payment !== undefined;

const calculatePaymentStatus = (
  payment: PaidReason | undefined,
  message: CreatedMessageWithContentAndAttachments
): PaymentStatus => {
  if (paid(payment)) {
    return "paid";
  } else if (isPaymentExpired(message)) {
    return "expired";
  } else if (isPaymentExpiring(message)) {
    return "expiring";
  } else {
    return "valid";
  }
};

const getNoticePaid = () => (
  <View style={styles.messagePaidBg}>
    <IconFont name="io-complete" color={IOColors.bluegreyDark} />
    <Text style={[styles.padded, { color: IOColors.bluegreyDark }]}>
      {I18n.t("wallet.errors.DUPLICATED")}
    </Text>
  </View>
);

/**
 * A component to show detailed info about the due date of a message
 */
const MessageDueDateBar: React.FunctionComponent<Props> = ({
  onGoToWallet,
  message,
  payment
}) => {
  /**
   * Display description on message deadlines
   */

  const paymentStatus = calculatePaymentStatus(payment, message);
  if (paymentStatus === "paid") {
    return getNoticePaid();
  }
  return pipe(
    message.content.due_date,
    O.fromNullable,
    O.fold(
      () => null,
      dueDate => (
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
      )
    )
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  onGoToWallet: () => navigateToWalletHome()
});

export default connect(undefined, mapDispatchToProps)(MessageDueDateBar);
