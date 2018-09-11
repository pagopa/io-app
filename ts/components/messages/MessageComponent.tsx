import { fromNullable } from "fp-ts/lib/Option";
import { DateFromISOString } from "io-ts-types";
import { Text, View } from "native-base";
import * as React from "react";
import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableWithoutFeedback
} from "react-native";
import * as AddCalendarEvent from "react-native-add-calendar-event";
import { Col, Grid, Row } from "react-native-easy-grid";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ParamType as MessageDetailsScreenParam } from "../../screens/messages/MessageDetailsScreen";
import { ReduxProps } from "../../store/actions/types";
import {
  paymentRequestMessage,
  paymentRequestTransactionSummaryFromRptId
} from "../../store/actions/wallet/payment";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { formatDateAsReminder } from "../../utils/dates";
import { getRptIdAndAmountFromMessage } from "../../utils/payment";
import IconFont from "../ui/IconFont";
import MessageCTABar from "./MessageCTABar";

interface ReduxInjectedProps {
  serviceByIdMap: ServicesByIdState;
}

export type OwnProps = Readonly<{
  message: MessageWithContentPO;
  navigation: NavigationScreenProp<NavigationState>;
}>;

export type Props = OwnProps &
  ReduxProps &
  ReduxInjectedProps &
  NavigationInjectedProps;

const TouchableFeedbackComponent = Platform.select({
  ios: { Class: TouchableWithoutFeedback },
  android: { Class: TouchableNativeFeedback }
});

const styles = StyleSheet.create({
  mainContainer: {
    borderBottomColor: variables.brandLightGray,
    borderBottomWidth: 1,
    marginLeft: variables.contentPadding,
    marginRight: variables.contentPadding,
    paddingBottom: 16,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 23
  },

  iconContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row"
  },

  serviceText: {
    fontSize: variables.fontSize3
  },

  dateText: {
    color: variables.brandDarkGray,
    fontSize: variables.fontSize2
  },

  subjectRow: {
    paddingTop: 10
  }
});

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  public render() {
    const message = this.props.message;
    const { id, created_at, content, sender_service_id } = message;
    const { subject, due_date, payment_data } = content;

    const senderService = this.props.serviceByIdMap[sender_service_id];

    // Create an action that open the Calendar to let the user add an event
    const dispatchReminderAction = fromNullable(due_date)
      .map(_ => () => {
        return AddCalendarEvent.presentEventCreatingDialog({
          title: I18n.t("messages.cta.reminderTitle", {
            subject
          }),
          startDate: formatDateAsReminder(_),
          allDay: true
        });
      })
      .toUndefined();

    const rptIdAndAmount = getRptIdAndAmountFromMessage(
      this.props.serviceByIdMap,
      message
    );

    // dispatchPaymentAction, if defined, will begin the payment flow
    // related to the payment data contained in this message
    const dispatchPaymentAction: (() => void) | undefined = rptIdAndAmount
      .map(_ => () => {
        this.props.dispatch(paymentRequestMessage());
        this.props.dispatch(
          paymentRequestTransactionSummaryFromRptId(_.e1, _.e2)
        );
      })
      .toUndefined();

    const handleOnPress = () => {
      const params: MessageDetailsScreenParam = {
        message,
        senderService,
        dispatchReminderAction,
        dispatchPaymentAction
      };

      this.props.navigation.navigate(ROUTES.MESSAGE_DETAILS, params);
    };

    const senderServiceLabel = senderService
      ? `${senderService.organization_name} - ${senderService.department_name}`
      : I18n.t("messages.unknownSender");

    // try to convert createdAt to a human representation, fall back to original
    // value if createdAt cannot be converteed to a Date
    const uiCreatedAt = DateFromISOString.decode(created_at)
      .map(_ => convertDateToWordDistance(_, I18n.t("messages.yesterday")))
      .getOrElse(created_at);

    return (
      <TouchableFeedbackComponent.Class
        key={id}
        onPress={handleOnPress}
        onLongPress={handleOnPress}
      >
        <Grid style={styles.mainContainer}>
          <Row>
            <Col>
              <Text
                style={styles.serviceText}
                leftAlign={true}
                alternativeBold={true}
              >
                {senderServiceLabel}
              </Text>
            </Col>
            <Col>
              <Text style={styles.dateText} rightAlign={true}>
                {uiCreatedAt}
              </Text>
            </Col>
          </Row>
          <Row style={styles.subjectRow}>
            <Col size={11}>
              <Text leftAlign={true}>{subject}</Text>
            </Col>
            <Col size={1} style={styles.iconContainer}>
              <IconFont
                name="io-right"
                size={24}
                color={variables.contentPrimaryBackground}
              />
            </Col>
          </Row>
          <Row>
            <MessageCTABar
              dueDate={due_date}
              dispatchReminderAction={dispatchReminderAction}
              paymentData={payment_data}
              dispatchPaymentAction={dispatchPaymentAction}
            />
          </Row>
        </Grid>
      </TouchableFeedbackComponent.Class>
    );

    return (
      <View>
        <View>
          <Text>{subject}</Text>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxInjectedProps => ({
  serviceByIdMap: state.entities.services.byId
});

export default connect(mapStateToProps)(MessageComponent);
