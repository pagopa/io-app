import * as React from "react";

import { Button, Icon, Left, ListItem, Right, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { PaymentData } from "../../../definitions/backend/PaymentData";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { convertDateToWordDistance } from "../../utils/convertDateToWordDistance";

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
  paymentNoticeNumber: string;
  paymentAmount: number;
}>;

export type Props = OwnProps;

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.Component<Props> {
  public formattedAmount = (amount: number): string => {
    return I18n.toCurrency(amount / 100, { unit: "€ ", separator: "," });
  };

  public render() {
    const { navigate } = this.props.navigation;

    const {
      createdAt,
      id,
      markdown,
      paymentAmount,
      paymentData,
      serviceDepartmentName,
      serviceName,
      serviceOrganizationName,
      subject
    } = this.props;

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
        <View padded={paymentAmount !== undefined}>
          <Left>
            <Text leftAlign={true} alternativeBold={true}>
              {`${serviceOrganizationName} -  ${serviceDepartmentName}`}
            </Text>
            <Text leftAlign={true}>{subject}</Text>
          </Left>
          <Right>
            <Text formatDate={true}>
              {convertDateToWordDistance(
                new Date(createdAt),
                I18n.t("messages.yesterday")
              )}
            </Text>
            <Icon name="chevron-right" />
          </Right>
        </View>
        {paymentAmount !== null && (
          <Button block={true} small={true}>
            <Text>
              {`${I18n.t(
                "messages.paymentCta.payLabel"
              )} ${this.formattedAmount(paymentAmount)}`}
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
