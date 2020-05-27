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
  isExpired,
  isExpiring,
  isExpiringToday,
  isExpiringTomorrow,
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
    paddingRight: 60,
    paddingLeft: 5
  },
  highlight: {
    color: customVariables.brandHighlight
  },
  center: {
    justifyContent: "center"
  }
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

  get isPaymentExpired(): boolean {
    return this.paymentExpirationInfo.fold(false, info => isExpired(info));
  }

  get isPaymentExpiring(): boolean {
    return this.paymentExpirationInfo.fold(false, info => isExpiring(info));
  }

  get isPaymentExpiringToday(): boolean {
    return this.paymentExpirationInfo.fold(false, info =>
      isExpiringToday(info)
    );
  }

  get isPaymentExpiringTomorrow(): boolean {
    return this.paymentExpirationInfo.fold(false, info =>
      isExpiringTomorrow(info)
    );
  }

  get dueDate(): Option<Date> {
    return fromNullable(this.props.message.content.due_date);
  }

  get bannerStyle(): ViewStyle {
    if (this.paid) {
      return { backgroundColor: customVariables.brandGray };
    }

    if (this.isPaymentExpired) {
      return { backgroundColor: customVariables.brandDarkGray };
    }

    if (this.isPaymentExpiring) {
      return { backgroundColor: customVariables.calendarExpirableColor };
    }
    return { backgroundColor: customVariables.brandGray };
  }

  get textContent() {
    const { dueDate: maybeDueDate } = this;
    if (maybeDueDate.isNone()) {
      return undefined;
    }
    const dueDate = maybeDueDate.value;

    if (this.paid) {
      return (
        <React.Fragment>
          {`${I18n.t("messages.cta.payment.paid")} `}
          <Text link={true} onPress={this.props.onGoToWallet}>
            {I18n.t("wallet.wallet")}
          </Text>
        </React.Fragment>
      );
    }

    const time = format(dueDate, "HH.mm");

    if (this.isPaymentExpiringToday) {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.payment.expiringAlertToday")}
          <Text bold={true} white={true}>{` ${time}`}</Text>
        </React.Fragment>
      );
    }

    if (this.isPaymentExpiringTomorrow) {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.payment.expiringAlertTomorrow")}
          <Text bold={true} white={true}>{` ${time}`}</Text>
        </React.Fragment>
      );
    }

    const date = formatDateAsLocal(dueDate);

    if (this.isPaymentExpiring) {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.payment.expiringAlert")}
          <Text bold={true} white={true}>{` ${date} `}</Text>
          <Text white={true}>
            {I18n.t("messages.cta.payment.addMemo.block2")}
          </Text>
          <Text bold={true} white={true}>{` ${time}`}</Text>
        </React.Fragment>
      );
    }

    if (this.isPaymentExpired) {
      return (
        <React.Fragment>
          {I18n.t("messages.cta.payment.expiredAlert.block1")}
          <Text bold={true} white={true}>{` ${time} `}</Text>
          {I18n.t("messages.cta.payment.expiredAlert.block2")}
          <Text bold={true} white={true}>{` ${date}`}</Text>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {I18n.t("messages.cta.payment.addMemo.block1")}
        <Text bold={true}>{` ${date} `}</Text>
        {"["}
        {I18n.t("messages.cta.payment.addMemo.block2")}
        <Text bold={true}>{` ${time}`}</Text>
        {"]"}
      </React.Fragment>
    );
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
        : this.isPaymentExpiring
          ? customVariables.calendarExpirableColor
          : this.isPaymentExpired
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
              {this.textContent}
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

export default connect(
  undefined,
  mapDispatchToProps
)(MessageDueDateBar);
