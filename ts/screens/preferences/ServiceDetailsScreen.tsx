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
import { FlatList, ListRenderItem, ListRenderItemInfo } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import DefaultSubscreenHeader from "../../components/DefaultScreenHeader";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";

import I18n from "../../i18n";

import { ReduxProps } from "../../store/actions/types";
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
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>
              {
                this.props.services.byId[
                  this.props.navigation.state.params.serviceId
                ].service_name
              }
            </Text>
          </Body>
        </AppHeader>

        <Content>
          <DefaultSubscreenHeader
            screenTitle={I18n.t("services.title")}
            icon={require("../../../img/icons/gears.png")}
          />
          <Text>{I18n.t("services.subtitle")}</Text>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  services: state.entities.services
});

export default connect(mapStateToProps)(ServiceDetailsScreen);
