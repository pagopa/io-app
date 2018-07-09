import { Body, Button, Container, Content, Left, Text } from "native-base";
import * as React from "react";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";

import { PaymentData } from "../../../definitions/backend/PaymentData";
import MessageDetailsComponent from "../../components/messages/MessageDetailsComponent";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";

interface ParamTypeObject {
  createdAt: Date;
  markdown: string;
  paymentData: PaymentData;
  serviceDepartmentName: string;
  serviceName: string;
  serviceOrganizationName: string;
  subject: string;
}

interface ParamType {
  readonly details: ParamTypeObject;
}

interface StateParams extends NavigationState {
  readonly params: ParamType;
}

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<StateParams>;
}>;

type Props = OwnProps & NavigationInjectedProps;

/**
 * This screen show the Message Details for a simple message
 */
export class MessageDetailsScreen extends React.Component<Props, never> {
  private goBack() {
    this.props.navigation.goBack();
  }

  public render() {
    const {
      createdAt,
      markdown,
      paymentData,
      serviceDepartmentName,
      serviceName,
      serviceOrganizationName,
      subject
    } = this.props.navigation.state.params.details;
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("messageDetails.headerTitle")}</Text>
          </Body>
        </AppHeader>
        <Content noPadded={true}>
          <MessageDetailsComponent
            createdAt={createdAt}
            markdown={markdown}
            paymentData={paymentData}
            serviceDepartmentName={serviceDepartmentName}
            serviceName={serviceName}
            serviceOrganizationName={serviceOrganizationName}
            subject={subject}
          />
        </Content>
      </Container>
    );
  }
}
