import {
  Body,
  Button,
  Col,
  Container,
  Content,
  Grid,
  H1,
  H2,
  H3,
  Left,
  Row,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Switch } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { fromNullable } from "fp-ts/lib/Option";

import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";

import I18n from "../../i18n";

import { ProfileWithEmail } from "../../../definitions/backend/ProfileWithEmail";
import Markdown from "../../components/ui/Markdown";
import { ReduxProps } from "../../store/actions/types";
import { ContentState } from "../../store/reducers/content";
import { ServicesState } from "../../store/reducers/entities/services";
import { ProfileState } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

export interface IMessageDetailsScreenParam {
  readonly serviceId: string;
}

interface INavigationStateWithParams extends NavigationState {
  readonly params: IMessageDetailsScreenParam;
}

type ReduxMappedProps = Readonly<{
  services: ServicesState;
  content: ContentState;
  profile: ProfileState;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<INavigationStateWithParams>;
}>;

type Props = ReduxMappedProps & ReduxProps & OwnProps;

const INBOX_CHANNEL = "INBOX";
const EMAIL_CHANNEL = "EMAIL";
const PUSH_CHANNEL = "WEBHOOK";

const renderInformationRow = (label: string, info: string) => (
  <Row>
    <Col size={2}>
      <Button light={true} small={true} transparent={true}>
        <Text>{label}:</Text>
      </Button>
    </Col>
    <Col size={4}>
      <Button primary={true} small={true}>
        <Text>{info}</Text>
      </Button>
    </Col>
  </Row>
);

class ServiceDetailsScreen extends React.Component<Props> {
  private goBack() {
    this.props.navigation.goBack();
  }

  public render() {
    // collect the service
    const serviceId = this.props.navigation.state.params.serviceId;
    const service = this.props.services.byId[serviceId];

    // find out whether the service has been opted out
    const enabledChannels = fromNullable(this.props.profile)
      .mapNullable(
        _ => (ProfileWithEmail.is(_) ? _.blocked_inbox_or_channels : null)
      )
      .mapNullable(_ => _[serviceId])
      .map(_ => ({
        inbox: _.indexOf(INBOX_CHANNEL) === -1,
        email: _.indexOf(EMAIL_CHANNEL) === -1,
        push: _.indexOf(PUSH_CHANNEL) === -1
      }))
      .getOrElse({
        inbox: true,
        email: true,
        push: true
      });

    // collect the service metadata
    const serviceMetadata = this.props.content.servicesMetadata.byId[serviceId];

    // collect the organization metadata
    const maybeOrganizationMetadata = fromNullable(
      this.props.content.organizationsMetadata.byFiscalCode[
        service.organization_fiscal_code
      ]
    );

    const orgAddress = maybeOrganizationMetadata
      .mapNullable(_ => _.Indirizzo)
      .toNullable();

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{service.service_name}</Text>
          </Body>
        </AppHeader>

        <Content>
          <Grid>
            <Row>
              <Col>
                <H3>
                  {service.department_name}, {service.organization_name}
                </H3>
                <H1>{service.service_name}</H1>
              </Col>
            </Row>
            <View spacer={true} large={true} />
            <Row>
              <Col size={10}>
                <Text>{I18n.t("services.serviceIsEnabled")}</Text>
              </Col>
              <Col size={2}>
                <Switch value={enabledChannels.inbox} />
              </Col>
            </Row>
            {enabledChannels.inbox && <View spacer={true} />}
            {enabledChannels.inbox && (
              <Row>
                <Col size={1} />
                <Col size={9}>
                  <Text>{I18n.t("services.pushNotifications")}</Text>
                </Col>
                <Col size={2}>
                  <Switch value={enabledChannels.push} />
                </Col>
              </Row>
            )}
            {enabledChannels.inbox && <View spacer={true} />}
            {enabledChannels.inbox && (
              <Row>
                <Col size={1} />
                <Col size={9}>
                  <Text>{I18n.t("services.emailNotifications")}</Text>
                </Col>
                <Col size={2}>
                  <Switch value={enabledChannels.email} />
                </Col>
              </Row>
            )}
            <View spacer={true} large={true} />
            {serviceMetadata && (
              <Row>
                <Col>
                  <Markdown>{serviceMetadata.description}</Markdown>
                </Col>
              </Row>
            )}
            {serviceMetadata && <View spacer={true} large={true} />}
            <Row>
              <Col size={6}>
                <H2>{I18n.t("services.contactsAndInfo")}</H2>
              </Col>
            </Row>
            <View spacer={true} large={true} />
            {renderInformationRow("C.F.", service.organization_fiscal_code)}
            {orgAddress && <View spacer={true} />}
            {orgAddress && renderInformationRow("Indirizzo", orgAddress)}
          </Grid>
          <View spacer={true} large={true} />
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  services: state.entities.services,
  content: state.content,
  profile: state.profile
});

export default connect(mapStateToProps)(ServiceDetailsScreen);
