import { fromNullable, Option } from "fp-ts/lib/Option";
import { capitalize } from "lodash";
import { Text, View } from "native-base";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { connect } from "react-redux";
import reactotron from "reactotron-react-native";
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

type OwnProps = {
  message: CreatedMessageWithContent;
  service?: ServicePublic;
  payment?: PaidReason;
};

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

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
/*

const stringToOptionString = fromPredicate(s => s.length)
stringToOptionString("") // none
stringToOptionString("ciao") // some ciao

fromPredicate(s => s.length)(input).fold()

*/

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

const nullNever = (_: never): null => null;
type TextContentStatus =
  | "paid"
  | "expiring"
  | "expiredNotExpirable"
  | "expiredAndExpirable"
  | "valid";
const TextContent: React.FunctionComponent<{
  status: TextContentStatus;
  maybeDueDate: Option<Date>;
  onPaidPress: () => void;
}> = ({ status, maybeDueDate, onPaidPress }) =>
  maybeDueDate.fold(null, dueDate => {
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
      nullNever(status)
    );
  });

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

  get statusLabel(): TextContentStatus {
    reactotron.log(this.isPaymentExpired);
    reactotron.log(this.isPaymentExpirable);
    reactotron.log(this.isPaymentExpiring);
    reactotron.log(this.paid);
    reactotron.log(
      this.isPaymentExpired && this.isPaymentExpirable
        ? "expiredAndExpirable"
        : this.isPaymentExpired && !this.isPaymentExpirable
        ? "expiredNotExpirable"
        : this.isPaymentExpiring
        ? "expiring"
        : this.paid
        ? "paid"
        : "valid"
    );
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

  get dueDate(): Option<Date> {
    return fromNullable(this.props.message.content.due_date);
  }

  get bannerStyle(): ViewStyle {
    if (this.paid) {
      return { backgroundColor: customVariables.brandGray };
    }

    if (this.isPaymentExpired) {
      return {
        backgroundColor: this.isPaymentExpirable
          ? customVariables.brandDarkGray
          : customVariables.calendarExpirableColor
      };
    }

    if (this.isPaymentExpiring) {
      return { backgroundColor: customVariables.calendarExpirableColor };
    }
    return { backgroundColor: customVariables.brandGray };
  }

  // The calendar icon is shown if:
  // - the payment related to the message is not yet paid
  // - the message has a due date
  private renderCalendarIcon = () => {
    const { dueDate: maybeDueDate } = this;
    return maybeDueDate.fold(null, dd => {
      const iconBackgoundColor = this.paid
        ? customVariables.lighterGray
        : this.isPaymentExpiring || this.isPaymentExpired
        ? customVariables.colorWhite
        : customVariables.brandDarkGray;

      const textColor = this.paid
        ? customVariables.colorWhite
        : this.isPaymentExpiring || !this.isPaymentExpirable
        ? customVariables.calendarExpirableColor
        : this.isPaymentExpired && this.isPaymentExpirable
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
   * Display description on message deadlines
   */
  public render() {
    const { dueDate, paid } = this;

    if (dueDate.isNone()) {
      return null;
    }
    return (
      <React.Fragment>
        <View
          style={[
            styles.container,
            this.bannerStyle,
            paid ? styles.center : undefined
          ]}
        >
          <React.Fragment>
            {this.renderCalendarIcon()}
            <View hspacer={true} small={true} />

            <Text
              style={styles.text}
              white={
                !this.paid && (this.isPaymentExpiring || this.isPaymentExpired)
              }
            >
              <TextContent
                status={this.statusLabel}
                maybeDueDate={dueDate}
                onPaidPress={this.props.onGoToWallet}
              />
            </Text>
          </React.Fragment>
        </View>
        <View spacer={true} large={true} />
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onGoToWallet: () => dispatch(navigateToWalletHome())
});

export default connect(undefined, mapDispatchToProps)(MessageDueDateBar);
