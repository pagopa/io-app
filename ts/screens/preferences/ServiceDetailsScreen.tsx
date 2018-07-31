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
                <H3>{service.organization_name}</H3>
                <H1>{service.service_name}</H1>
              </Col>
            </Row>
            <Row>
              <Col>
                <View spacer={true} large={true} />
              </Col>
            </Row>
            <Row>
              <Col size={5}>
                <Text>Il Servizio è attivo</Text>
              </Col>
              <Col size={1}>
                <Switch value={true} />
              </Col>
            </Row>
            <Row>
              <Col>
                <View spacer={true} large={true} />
              </Col>
            </Row>
            {metadata && (
              <Row>
                <Col>
                  <Markdown>{metadata.description}</Markdown>
                </Col>
              </Row>
            )}
            {metadata && (
              <Row>
                <Col>
                  <View spacer={true} large={true} />
                </Col>
              </Row>
            )}
            <Row>
              <Col size={6}>
                <H2>Contatti ed informazioni</H2>
              </Col>
            </Row>
            <Row>
              <Col>
                <View spacer={true} large={true} />
              </Col>
            </Row>
            <Row>
              <Col size={2}>
                <Text>Indirizzo:</Text>
              </Col>
              <Col size={4}>
                <Button primary={true} small={true}>
                  <Text>Via Larga, 12, 20122 Milano MI</Text>
                </Button>
              </Col>
            </Row>
          </Grid>
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
