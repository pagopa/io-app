import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Icon,
  Left,
  Text
} from "native-base";
import * as React from "react";
import {
  NavigationInjectedProps,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import MessageDetailsComponent from "../../components/messagges/MessageDetailsComponent";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";

interface ParamTypeObject {
  subject: string;
  serviceOrganizationName: string;
  serviceDepartmentName: string;
  markdown: string;
  service: string;
  date: Date;
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
 * This screen show the messages to the authenticated user.
 *
 * TODO: Just a mocked version at the moment.
 * Going to be replaced with real content in @https://www.pivotaltracker.com/story/show/152843981
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
      date,
      service,
      serviceDepartmentName
    } = this.props.navigation.state.params.details;
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <Icon name="chevron-left" />
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
            service={service}
            serviceOrganizationName={serviceOrganizationName}
            date={date}
            serviceDepartmentName={serviceDepartmentName}
          />
        </Content>
      </Container>
    );
  }
}
