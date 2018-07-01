import { Body, Button, Container, Content, H1, Left, Text } from "native-base";
import * as React from "react";
import { NavigationScreenProps, NavigationState } from "react-navigation";
import MessageDetailsComponent from "../../components/messages/MessageDetailsComponent";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";

interface ParamTypeObject {
  subject: string;
  serviceOrganizationName: string;
  serviceDepartmentName: string;
  markdown: string;
  serviceName: string;
  createdAt: Date;
}

interface ParamType {
  readonly details: ParamTypeObject;
}

interface StateParams {
  readonly params: ParamType;
}

type OwnProps = NavigationScreenProps<NavigationState & StateParams>;

type Props = OwnProps;

/**
 * This screen show the Message Details for a simple message
 */
export class MessageDetailsScreen extends React.Component<Props, never> {
  private goBack() {
    this.props.navigation.goBack();
  }

  public render() {
    const {
      subject,
      markdown,
      serviceOrganizationName,
      createdAt,
      serviceName,
      serviceDepartmentName
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
        <Content>
          <H1>{subject}</H1>
          <MessageDetailsComponent
            markdown={markdown}
            serviceName={serviceName}
            serviceOrganizationName={serviceOrganizationName}
            createdAt={createdAt}
            serviceDepartmentName={serviceDepartmentName}
          />
        </Content>
      </Container>
    );
  }
}
