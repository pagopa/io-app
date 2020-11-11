import { fromNullable, Option } from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
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
  isExpirable,
  isExpired,
  isExpiring,
  paymentExpirationInfo
} from "../../utils/messages";
import CalendarIconComponent from "./CalendarIconComponent";

const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled case in switch. Value should be never, received this instead: ${value}`
  );
};

type OwnProps = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
};

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

type PaymentStatus =
  | "paid"
  | "expiring"
  | "expiredNotExpirable"
  | "expiredAndExpirable"
  | "valid";

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
  }
});

const PaidMessage: React.FunctionComponent<{
  onPress: () => void;
}> = ({ onPress }) => (
  <>
    {`${I18n.t("messages.cta.payment.paid")} `}
    <Text link={true} onPress={onPress}>
      {I18n.t("wallet.wallet")}
    </Text>
  </>
);

const ExpiringMessage: React.FunctionComponent<{
  time: string;
  date: string;
}> = ({ time, date }) => (
  <>
    {I18n.t("messages.cta.payment.expiringAlert.block1")}
    <Text bold={true} white={true}>{` ${date} `}</Text>
    {I18n.t("messages.cta.payment.expiringAlert.block2")}
    <Text bold={true} white={true}>{` ${time} `}</Text>
  </>
);

const ExpiredExpirableMessage: React.FunctionComponent<{
  time: string;
  date: string;
}> = ({ time, date }) => (
  <>
    {I18n.t("messages.cta.payment.expiredAlert.expirable.block1")}
    <Text bold={true} white={true}>{` ${time} `}</Text>
    {I18n.t("messages.cta.payment.expiredAlert.expirable.block2")}
    <Text bold={true} white={true}>{` ${date}`}</Text>
  </>
);

const ValidMessage: React.FunctionComponent<{
  time: string;
  date: string;
}> = ({ time, date }) => (
  <>
    {I18n.t("messages.cta.payment.addMemo.block1")}
    <Text bold={true}>{` ${date} `}</Text>
    {"["}
    {I18n.t("messages.cta.payment.addMemo.block2")}
    <Text bold={true}>{` ${time}`}</Text>
    {"]"}
  </>
);

const ExpiredNotExpirableMessage: React.FunctionComponent = () => (
  <>{I18n.t("messages.cta.payment.expiredAlert.unexpirable.block")}</>
);

const TextContent: React.FunctionComponent<{
  status: PaymentStatus;
  dueDate: Date;
  onPaidPress: () => void;
}> = ({ status, dueDate, onPaidPress }) => {
  const time = format(dueDate, "HH.mm");
  const date = formatDateAsLocal(dueDate, true, true);
  return status === "paid" ? (
    <PaidMessage onPress={onPaidPress} />
  ) : status === "expiring" ? (
    <ExpiringMessage time={time} date={date} />
  ) : status === "expiredAndExpirable" ? (
    <ExpiredExpirableMessage time={time} date={date} />
  ) : status === "expiredNotExpirable" ? (
    <ExpiredNotExpirableMessage />
  ) : status === "valid" ? (
    <ValidMessage time={time} date={date} />
  ) : (
    assertNever(status)
  );
};

// The calendar icon is shown if:
// - the payment related to the message is not yet paid
// - the message has a due date
const CalendarIcon: React.FunctionComponent<{
  status: PaymentStatus;
  dueDate: Date;
}> = ({ status, dueDate }) => {
  const iconBackgoundColor =
    status === "paid"
      ? customVariables.lighterGray
      : status === "expiring" ||
        status === "expiredAndExpirable" ||
        status === "expiredNotExpirable"
      ? customVariables.colorWhite
      : status === "valid"
      ? customVariables.brandDarkGray
      : assertNever(status);

  const textColor =
    status === "paid"
      ? customVariables.colorWhite
      : status === "expiring" || status === "expiredNotExpirable"
      ? customVariables.calendarExpirableColor
      : status === "expiredAndExpirable"
      ? customVariables.brandDarkGray
      : status === "valid"
      ? customVariables.colorWhite
      : assertNever(status);

  return (
    <CalendarIconComponent
      month={capitalize(formatDateAsMonth(dueDate))}
      day={formatDateAsDay(dueDate)}
      backgroundColor={iconBackgoundColor}
      textColor={textColor}
    />
  );
};

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

  get isPaymentExpirable(): boolean {
    return this.paymentExpirationInfo.fold(false, isExpirable);
  }

  get isPaymentExpired(): boolean {
    return this.paymentExpirationInfo.fold(false, isExpired);
  }

  get isPaymentExpiring(): boolean {
    return this.paymentExpirationInfo.fold(false, isExpiring);
  }

  get paymentStatus(): PaymentStatus {
    return this.isPaymentExpired && this.isPaymentExpirable
      ? "expiredAndExpirable"
      : this.isPaymentExpired && !this.isPaymentExpirable
      ? "expiredNotExpirable"
      : this.isPaymentExpiring
      ? "expiring"
      : this.paid
      ? "paid"
      : "valid";
  }

  get maybeDueDate(): Option<Date> {
    return fromNullable(this.props.message.content.due_date);
  }

  get bannerStyle(): ViewStyle {
    const status = this.paymentStatus;

    return status === "paid"
      ? { backgroundColor: customVariables.brandGray }
      : status === "expiredAndExpirable"
      ? { backgroundColor: customVariables.brandDarkGray }
      : status === "expiredNotExpirable"
      ? { backgroundColor: customVariables.calendarExpirableColor }
      : status === "expiring"
      ? { backgroundColor: customVariables.calendarExpirableColor }
      : status === "valid"
      ? { backgroundColor: customVariables.brandGray }
      : assertNever(status);
  }

  /**
   * Display description on message deadlines
   */
  public render() {
    const {
      maybeDueDate,
      paymentStatus,
      props: { onGoToWallet },
      bannerStyle
    } = this;

    return maybeDueDate.fold(null, dueDate => (
      <>
        <View
          style={[
            styles.container,
            bannerStyle,
            paymentStatus === "paid" ? styles.center : undefined
          ]}
        >
          <>
            <CalendarIcon status={paymentStatus} dueDate={dueDate} />
            <View hspacer={true} small={true} />

            <Text
              style={styles.text}
              white={
                paymentStatus === "expiring" ||
                paymentStatus === "expiredAndExpirable" ||
                paymentStatus === "expiredNotExpirable"
              }
            >
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
    ));
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onGoToWallet: () => dispatch(navigateToWalletHome())
});

export default connect(undefined, mapDispatchToProps)(MessageDueDateBar);
