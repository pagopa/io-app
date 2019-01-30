import { isSome, none } from "fp-ts/lib/Option";
import { RptIdFromString } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { navigateToPaymentTransactionSummaryScreen } from "../../store/actions/navigation";
import { ReduxProps } from "../../store/actions/types";
import { paymentInitializeState } from "../../store/actions/wallet/payment";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { checkAndRequestPermission } from "../../utils/calendar";
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
import { showToast } from "../../utils/showToast";
import CalendarIconComponent from "../CalendarIconComponent";
import { withLightModalContext } from "../helpers/withLightModalContext";
import SelectCalendarModal from "../SelectCalendarModal";
import { LightModalContextInterface } from "../ui/LightModal";

type OwnProps = {
  message: MessageWithContentPO;
  service: pot.Pot<ServicePublic, Error>;
  containerStyle?: ViewStyle;
  paymentByRptId: PaymentByRptIdState;
};

type Props = OwnProps & LightModalContextInterface & ReduxProps;

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

const SelectCalendarModalHeader = (
  <H1>{I18n.t("messages.cta.reminderCalendarSelect")}</H1>
);

class MessageCTABar extends React.PureComponent<Props> {
  private renderReminderCTA(
    dueDate: NonNullable<MessageWithContentPO["content"]["due_date"]>
  ) {
    const { message, showModal } = this.props;
    // Create an action that open the Calendar to let the user add an event
    const onPressHandler = () => {
      // Check the authorization status
      checkAndRequestPermission()
        .then(hasPermission => {
          if (hasPermission) {
            showModal(
              <SelectCalendarModal
                onCancel={this.onSelectCalendarCancel}
                onCalendarSelected={this.addReminderToCalendar(
                  message,
                  dueDate
                )}
                header={SelectCalendarModalHeader}
              />
            );
          }
        })
        // No permission to add the reminder
        .catch();
    };

    return (
      <View style={styles.reminderContainer}>
        <CalendarIconComponent
          height="48"
          width="48"
          month={formatDateAsMonth(dueDate)}
          day={formatDateAsDay(dueDate)}
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
    paymentData: NonNullable<MessageWithContentPO["content"]["payment_data"]>,
    potService: pot.Pot<ServicePublic, Error>,
    paymentByRptId: PaymentByRptIdState
  ) {
    const amount = getAmountFromPaymentAmount(paymentData.amount);

    const rptId = pot.getOrElse(
      pot.map(potService, service =>
        getRptIdFromNoticeNumber(
          service.organization_fiscal_code,
          paymentData.notice_number
        )
      ),
      none
    );

    const isPaid = rptId
      .map(RptIdFromString.encode)
      .map(_ => paymentByRptId[_] !== undefined)
      .getOrElse(false);

    const onPaymentCTAPress =
      !isPaid && isSome(amount) && isSome(rptId)
        ? () => {
            this.props.dispatch(paymentInitializeState());
            this.props.dispatch(
              navigateToPaymentTransactionSummaryScreen({
                rptId: rptId.value,
                initialAmount: amount.value
              })
            );
          }
        : undefined;

    return (
      <View style={styles.paymentContainer}>
        <Button
          block={true}
          onPress={onPaymentCTAPress}
          disabled={onPaymentCTAPress === undefined || isPaid}
        >
          <Text>
            {I18n.t(isPaid ? "messages.cta.paid" : "messages.cta.pay", {
              amount: formatPaymentAmount(paymentData.amount)
            })}
          </Text>
        </Button>
      </View>
    );
  }

  public render() {
    const { message, service, containerStyle, paymentByRptId } = this.props;

    const { due_date, payment_data } = message.content;

    if (due_date !== undefined || payment_data !== undefined) {
      return (
        <View style={[styles.mainContainer, containerStyle]}>
          {due_date !== undefined && this.renderReminderCTA(due_date)}

          {due_date !== undefined &&
            payment_data !== undefined && (
              <View style={styles.separatorContainer} />
            )}

          {payment_data !== undefined &&
            this.renderPaymentCTA(payment_data, service, paymentByRptId)}
        </View>
      );
    }

    return null;
  }

  private onSelectCalendarCancel = () => {
    this.props.hideModal();
  };

  private addReminderToCalendar = (
    message: MessageWithContentPO,
    dueDate: Date
  ) => (calendar: Calendar) => {
    const title = I18n.t("messages.cta.reminderTitle", {
      title: message.content.subject
    });
    this.props.hideModal();
    RNCalendarEvents.saveEvent(title, {
      title,
      calendarId: calendar.id,
      startDate: formatDateAsReminder(dueDate),
      endDate: formatDateAsReminder(dueDate),
      allDay: true,
      alarms: []
    })
      .then(_ =>
        showToast(
          I18n.t("messages.cta.reminderAddSuccess", {
            title,
            calendarTitle: calendar.title
          }),
          "success"
        )
      )
      .catch(_ =>
        showToast(I18n.t("messages.cta.reminderAddFailure"), "danger")
      );
  };
}

export default connect()(withLightModalContext(MessageCTABar));
