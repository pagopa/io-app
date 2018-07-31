import {
  Body,
  Button,
  Container,
  Content,
  H3,
  Left,
  ListItem,
  Right,
  Text
} from "native-base";
import * as React from "react";
import { Switch } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";

import I18n from "../../i18n";

import { Grid } from "native-base";
import { View } from "native-base";
import { H2 } from "native-base";
import { H1 } from "native-base";
import { Col } from "native-base";
import { Row } from "native-base";
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
    const metadata = this.props.content.servicesMetadata.byId[serviceId];
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
                <Text>Il Servizio è attivo</Text>
              </Col>
              <Col size={1}>
                <Switch value={true} />
              </Col>
            </Row>
            <View spacer={true} large={true} />
            {metadata && (
              <Row>
                <Col>
                  <Markdown>{metadata.description}</Markdown>
                </Col>
              </Row>
            )}
            {metadata && <View spacer={true} large={true} />}
            <Row>
              <Col size={6}>
                <H2>Contatti ed informazioni</H2>
              </Col>
            </Row>
            <View spacer={true} large={true} />
            {renderInformationRow("C.F.", service.organization_fiscal_code)}
            <View spacer={true} />
            {renderInformationRow(
              "Indirizzo",
              "Via Larga, 12, 20122 Milano MI"
            )}
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
