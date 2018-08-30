import { fromNullable } from "fp-ts/lib/Option";
import { DateFromISOString } from "io-ts-types";
import { Left, ListItem, Right, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import * as AddCalendarEvent from "react-native-add-calendar-event";
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
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { formatDateAsReminder } from "../../utils/dates";
import { getRptIdAndAmountFromMessage } from "../../utils/payment";
import { MessageCTABar } from "./MessageCTABar";

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

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  public render() {
    const message = this.props.message;
    const {
      id,
      subject,
      created_at,
      due_date,
      payment_data,
      sender_service_id
    } = message;

    const senderService = this.props.serviceByIdMap[sender_service_id];

    // Create an action that open the Calendar to let the user add an event
    const dispatchReminderAction = fromNullable(due_date)
      .map(_ => () => {
        return AddCalendarEvent.presentEventCreatingDialog({
          title: I18n.t("messages.cta.reminderTitle", {
            subject: message.subject
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
      ? `${senderService.organization_name}`
      : I18n.t("messages.unknownSender");

    // try to convert createdAt to a human representation, fall back to original
    // value if createdAt cannot be converteed to a Date
    const uiCreatedAt = DateFromISOString.decode(created_at)
      .map(_ => convertDateToWordDistance(_, I18n.t("messages.yesterday")))
      .getOrElse(created_at);

    return (
      <ListItem key={id} onPress={handleOnPress}>
        <View padded={payment_data !== undefined || due_date !== undefined}>
          <Left>
            <Text leftAlign={true} alternativeBold={true}>
              {senderServiceLabel}
            </Text>
            <Text leftAlign={true}>{subject}</Text>
          </Left>
          <Right>
            <Text formatDate={true}>{uiCreatedAt}</Text>
          </Right>
        </View>
        <MessageCTABar
          dueDate={due_date}
          dispatchReminderAction={dispatchReminderAction}
          paymentData={payment_data}
          dispatchPaymentAction={dispatchPaymentAction}
        />
      </ListItem>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxInjectedProps => ({
  serviceByIdMap: state.entities.services.byId
});

const connectedMessageComponent = connect(mapStateToProps)(MessageComponent);

const StyledMessageComponent = connectStyle(
  "UIComponent.MessageComponent",
  {},
  mapPropsToStyleNames
)(connectedMessageComponent);
export default StyledMessageComponent;
