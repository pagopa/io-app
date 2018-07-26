import {
  Body,
  Container,
  Content,
  H3,
  Left,
  List,
  ListItem,
  Right,
  Text
} from "native-base";
import * as React from "react";
import DeviceInfo from "react-native-device-info";
import { connect } from "react-redux";

import DefaultSubscreenHeader from "../../components/DefaultScreenHeader";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";

import I18n from "../../i18n";

import { ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

type ReduxMappedProps = Readonly<{}>;

type Props = ReduxMappedProps & ReduxProps;

class ServicesScreen extends React.Component<Props> {
  public render() {
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{DeviceInfo.getApplicationName()}</Text>
          </Body>
        </AppHeader>

        <Content>
          <DefaultSubscreenHeader
            screenTitle={I18n.t("services.title")}
            icon={require("../../../img/icons/gears.png")}
          />
          <Text>{I18n.t("services.subtitle")}</Text>
          <List>
            <ListItem>
              <Left>
                <H3>Anagrafe</H3>
                <Text>
                  Servizio attivo. Notifiche push attive. Email attive.
                </Text>
              </Left>
              <Right>
                <IconFont name="io-right" />
              </Right>
            </ListItem>
          </List>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (): ReduxMappedProps => ({});

export default connect(mapStateToProps)(ServicesScreen);
