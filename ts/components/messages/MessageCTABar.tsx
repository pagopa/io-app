import { Button, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { EventCreationResult } from "react-native-add-calendar-event";

import { PaymentData } from "../../../definitions/backend/PaymentData";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { formatDateAsDay, formatDateAsMonth } from "../../utils/dates";
import { formatPaymentAmount } from "../../utils/payment";
import CalendarIconComponent from "../CalendarIconComponent";

type Props = {
  dueDate?: Date;
  dispatchReminderAction?: () => Promise<EventCreationResult>;
  paymentData?: PaymentData;
  dispatchPaymentAction?: () => void;
  containerStyle?: ViewStyle;
};

const styles = StyleSheet.create({
  mainContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    marginTop: 16
  },
  dueDateContainer: {
    display: "flex",
    flexDirection: "row",
    flex: 6,
    alignItems: "center"
  },
  dueDateButtonContainer: {
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

class MessageCTABar extends React.Component<Props> {
  private renderDueDateCTA(
    dueDate: Date,
    dispatchReminderAction: () => Promise<EventCreationResult>
  ) {
    return (
      <View style={styles.dueDateContainer}>
        <CalendarIconComponent
          height="48"
          width="48"
          month={formatDateAsMonth(dueDate)}
          day={formatDateAsDay(dueDate)}
          backgroundColor={variables.brandDarkGray}
          textColor={variables.colorWhite}
        />

        <View style={styles.dueDateButtonContainer}>
          <Button
            block={true}
            bordered={true}
            onPress={() => dispatchReminderAction().catch(_ => undefined)}
          >
            <Text>{I18n.t("messages.cta.reminder")}</Text>
          </Button>
        </View>
      </View>
    );
  }

  private renderPaymentCTA(
    paymentData: PaymentData,
    dispatchPaymentAction: () => void
  ) {
    return (
      <View style={styles.paymentContainer}>
        <Button block={true} onPress={dispatchPaymentAction}>
          <Text>
            {I18n.t("messages.cta.pay", {
              amount: formatPaymentAmount(paymentData.amount)
            })}
          </Text>
        </Button>
      </View>
    );
  }

  public render() {
    const {
      dueDate,
      dispatchReminderAction,
      paymentData,
      dispatchPaymentAction,
      containerStyle
    } = this.props;
    if (
      (dueDate && dispatchReminderAction) ||
      (paymentData && dispatchPaymentAction)
    ) {
      return (
        <View style={[styles.mainContainer, containerStyle]}>
          {dueDate &&
            dispatchReminderAction &&
            this.renderDueDateCTA(dueDate, dispatchReminderAction)}
          {dueDate &&
            dispatchReminderAction &&
            paymentData &&
            dispatchPaymentAction && <View style={styles.separatorContainer} />}
          {paymentData !== undefined &&
            dispatchPaymentAction !== undefined &&
            this.renderPaymentCTA(paymentData, dispatchPaymentAction)}
        </View>
      );
    }
    return null;
  }
}

export default MessageCTABar;
