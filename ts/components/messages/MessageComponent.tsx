import * as React from "react";

import { DateFromISOString } from "io-ts-types";
import pick from "lodash/pick";
import { Button, Icon, Left, ListItem, Right, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import {
  messageDetailsByIdSelector,
  MessageDetailsByIdState
} from "../../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../../store/reducers/types";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { formatPaymentAmount } from "../../utils/payment";

export type OwnProps = MessageDetailsByIdState &
  Readonly<{
    navigation: NavigationScreenProp<NavigationState>;
  }>;

export type Props = OwnProps;

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  private handleOnPress = () => {
    const params = {
      details: pick(this.props, [
        "createdAt",
        "id",
        "markdown",
        "paymentData",
        "serviceDepartmentName",
        "serviceName",
        "serviceOrganizationName",
        "subject"
      ])
    };

    this.props.navigation.navigate(ROUTES.MESSAGE_DETAILS, params);
  };

  public render() {
    const {
      id,
      serviceOrganizationName,
      serviceDepartmentName,
      subject,
      createdAt,
      paymentData
    } = this.props;

    // try to convert createdAt to a human representation, fall back to original
    // value if createdAt cannot be converteed to a Date
    const uiCreatedAt = DateFromISOString.decode(createdAt)
      .map(_ => convertDateToWordDistance(_, I18n.t("messages.yesterday")))
      .getOrElse(createdAt);

    return (
      <ListItem key={id} onPress={this.handleOnPress}>
        <View padded={paymentData !== undefined}>
          <Left>
            <Text leftAlign={true} alternativeBold={true}>
              {`${serviceOrganizationName} - ${serviceDepartmentName}`}
            </Text>
            <Text leftAlign={true}>{subject}</Text>
          </Left>
          <Right>
            <Text formatDate={true}>{uiCreatedAt}</Text>
            <Icon name="chevron-right" />
          </Right>
        </View>
        {paymentData !== undefined && (
          <Button block={true} small={true}>
            <Text>
              {I18n.t("messages.cta.pay", {
                amount: formatPaymentAmount(paymentData.amount)
              })}
            </Text>
          </Button>
        )}
      </ListItem>
    );
  }
}

const mapStateToProps = (state: GlobalState, { id }: Props) => {
  const messageDetails = messageDetailsByIdSelector(id)(state);

  return messageDetails || {};
};

const connectedMessageComponent = connect(mapStateToProps)(MessageComponent);

const StyledMessageComponent = connectStyle(
  "UIComponent.MessageComponent",
  {},
  mapPropsToStyleNames
)(connectedMessageComponent);
export default StyledMessageComponent;
