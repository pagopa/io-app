import { isSome, none } from "fp-ts/lib/Option";
import { Button, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import * as AddCalendarEvent from "react-native-add-calendar-event";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { ReduxProps } from "../../store/actions/types";

import { navigateToPaymentTransactionSummaryScreen } from "../../store/actions/navigation";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import {
  formatDateAsDay,
  formatDateAsMonth,
  formatDateAsReminder
} from "../../utils/dates";
import {
  formatPaymentAmount,
  getAmountFromPaymentAmount,
  getRptIdFromNoticeNumber
} from "../../utils/payment";
import CalendarIconComponent from "../CalendarIconComponent";

type OwnProps = {
  message: MessageWithContentPO;
  service?: ServicePublic;
  containerStyle?: ViewStyle;
};

type Props = OwnProps & ReduxProps;

const styles = StyleSheet.create({
  mainContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "row"
  },

  reminderContainer: {
    display: "flex",
    flexDirection: "row",
    flex: 6,
    alignItems: "center"
  },
  reminderButtonContainer: {
    marginLeft: 10,
    flex: 12
  },

  separatorContainer: {
    width: 10
  },

  paymentContainer: {
    flex: 6
  }
});

function needReminderCTA(message: MessageWithContentPO) {
  return message.content.due_date !== undefined;
}

function needPaymentCTA(
  message: MessageWithContentPO,
  service?: ServicePublic
) {
  return message.content.payment_data !== undefined && service !== undefined;
}

class MessageCTABar extends React.PureComponent<Props> {
  private renderReminderCTA(message: MessageWithContentPO) {
    if (message.content.due_date === undefined) {
      return null;
    }

    const { subject, due_date } = message.content;
    // Create an action that open the Calendar to let the user add an event
    const onPressHandler = () =>
      AddCalendarEvent.presentEventCreatingDialog({
        title: I18n.t("messages.cta.reminderTitle", {
          subject
        }),
        startDate: formatDateAsReminder(due_date),
        endDate: formatDateAsReminder(due_date),
        allDay: true
      }).catch(_ => undefined);

    return (
      <View style={styles.reminderContainer}>
        <CalendarIconComponent
          height="48"
          width="48"
          month={formatDateAsMonth(due_date)}
          day={formatDateAsDay(due_date)}
          backgroundColor={variables.brandDarkGray}
          textColor={variables.colorWhite}
        />

        <View style={styles.reminderButtonContainer}>
          <Button block={true} bordered={true} onPress={onPressHandler}>
            <Text>{I18n.t("messages.cta.reminder")}</Text>
          </Button>
        </View>
      </View>
    );
  }

  private renderPaymentCTA(
    message: MessageWithContentPO,
    service?: ServicePublic
  ) {
    if (message.content.payment_data && service) {
      const { payment_data } = message.content;

      const amount = getAmountFromPaymentAmount(payment_data.amount);

      const rptId = getRptIdFromNoticeNumber(
        service.organization_fiscal_code,
        payment_data.notice_number
      );

      if (isSome(amount) && isSome(rptId)) {
        const onPaymentCTAPress = () => {
          this.props.dispatch(
            navigateToPaymentTransactionSummaryScreen({
              rptId: rptId.value,
              initialAmount: amount.value,
              maybePaymentId: none
            })
          );
        };

        return (
          <View style={styles.paymentContainer}>
            <Button block={true} onPress={onPaymentCTAPress}>
              <Text>
                {I18n.t("messages.cta.pay", {
                  amount: formatPaymentAmount(payment_data.amount)
                })}
              </Text>
            </Button>
          </View>
        );
      }
    }

    return null;
  }

  public render() {
    const { message, service, containerStyle } = this.props;

    if (needReminderCTA(message) || needPaymentCTA(message, service)) {
      return (
        <View style={[styles.mainContainer, containerStyle]}>
          {this.renderReminderCTA(message)}

          {needReminderCTA(message) &&
            needPaymentCTA(message, service) && (
              <View style={styles.separatorContainer} />
            )}

          {this.renderPaymentCTA(message, service)}
        </View>
      );
    }

    return null;
  }
}

export default connect()(MessageCTABar);
