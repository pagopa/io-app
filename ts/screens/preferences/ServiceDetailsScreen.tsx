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

import Markdown from "../../components/ui/Markdown";
import { ReduxProps } from "../../store/actions/types";
import { ContentState } from "../../store/reducers/content";
import { ServicesState } from "../../store/reducers/entities/services";
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
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<INavigationStateWithParams>;
}>;

type Props = ReduxMappedProps & ReduxProps & OwnProps;

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
    const serviceId = this.props.navigation.state.params.serviceId;
    const service = this.props.services.byId[serviceId];

    const serviceMetadata = this.props.content.servicesMetadata.byId[serviceId];
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
              <Col size={5}>
                <Text>{I18n.t("services.serviceIsEnabled")}</Text>
              </Col>
              <Col size={1}>
                <Switch value={true} />
              </Col>
            </Row>
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
  content: state.content
});

export default connect(mapStateToProps)(ServiceDetailsScreen);
