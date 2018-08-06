import * as React from "react";

import { DateFromISOString } from "io-ts-types";
import { Button, Icon, Left, ListItem, Right, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";

import ROUTES from "../../navigation/routes";

import { ReduxProps } from "../../store/actions/types";
import {
  paymentRequestMessage,
  paymentRequestTransactionSummaryFromRptId
} from "../../store/actions/wallet/payment";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";

import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import {
  formatPaymentAmount,
  getRptIdAndAmountFromMessage
} from "../../utils/payment";

import { MessageWithContentPO } from "../../types/MessageWithContentPO";

import { ParamType as MessageDetailsScreenParam } from "../../screens/messages/MessageDetailsScreen";

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
      payment_data,
      sender_service_id
    } = message;

    const senderService = this.props.serviceByIdMap[sender_service_id];

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
        <View padded={payment_data !== undefined}>
          <Left>
            <Text leftAlign={true} alternativeBold={true}>
              {senderServiceLabel}
            </Text>
            <Text leftAlign={true}>{subject}</Text>
          </Left>
          <Right>
            <Text formatDate={true}>{uiCreatedAt}</Text>
            <Icon name="chevron-right" />
          </Right>
        </View>
        {payment_data !== undefined &&
          dispatchPaymentAction !== undefined && (
            <Button block={true} small={true} onPress={dispatchPaymentAction}>
              <Text>
                {I18n.t("messages.cta.pay", {
                  amount: formatPaymentAmount(payment_data.amount)
                })}
              </Text>
            </Button>
          )}
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
