import * as React from "react";

import { Button, Icon, Left, ListItem, Right, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { DateFromISOString } from "io-ts-types";

import { PaymentData } from "../../../definitions/backend/PaymentData";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";
import { formatPaymentAmount } from "../../utils/payment";

export type OwnProps = Readonly<{
  createdAt: string;
  id: string;
  markdown: string;
  navigation: NavigationScreenProp<NavigationState>;
  paymentData: PaymentData;
  serviceName: string;
  serviceOrganizationName: string;
  serviceDepartmentName: string;
  subject: string;
}>;

export type Props = OwnProps;

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  public render() {
    const { navigate } = this.props.navigation;

    const {
      createdAt,
      id,
      markdown,
      paymentData,
      serviceDepartmentName,
      serviceName,
      serviceOrganizationName,
      subject
    } = this.props;

    // try to convert createdAt to a human representation, fall back to original
    // value if createdAt cannot be converteed to a Date
    const uiCreatedAt = DateFromISOString.decode(createdAt)
      .map(_ => convertDateToWordDistance(_, I18n.t("messages.yesterday")))
      .getOrElse(createdAt);

    return (
      <ListItem
        key={id}
        onPress={() => {
          navigate(ROUTES.MESSAGE_DETAILS, {
            details: {
              createdAt,
              markdown,
              paymentData,
              serviceName,
              serviceDepartmentName,
              serviceOrganizationName,
              subject
            }
          });
        }}
      >
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

const StyledMessageComponent = connectStyle(
  "UIComponent.MessageComponent",
  {},
  mapPropsToStyleNames
)(MessageComponent);
export default StyledMessageComponent;
