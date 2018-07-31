import {
  Body,
  Button,
  Container,
  Content,
  H2,
  H3,
  Left,
  ListItem,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import {
  ListRenderItem,
  ListRenderItemInfo,
  SectionList,
  SectionListData
} from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import DefaultSubscreenHeader from "../../components/DefaultScreenHeader";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";

import I18n from "../../i18n";

import ROUTES from "../../navigation/routes";
import { contentServiceLoad } from "../../store/actions/content";
import { ReduxProps } from "../../store/actions/types";
import { OrganizationNamesByFiscalCodeState } from "../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
import { ServicesState } from "../../store/reducers/entities/services";
import { GlobalState } from "../../store/reducers/types";
import { IMessageDetailsScreenParam } from "./ServiceDetailsScreen";

type ReduxMappedProps = Readonly<{
  services: ServicesState;
  organizations: OrganizationNamesByFiscalCodeState;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReduxMappedProps & ReduxProps & OwnProps;

class ServicesScreen extends React.Component<Props> {
  private goBack() {
    this.props.navigation.goBack();
  }

  private getServiceKey = (serviceId: string): string => {
    const servicesById = this.props.services.byId;
    const service = servicesById[serviceId];
    const serviceVersion = (service ? service.version : undefined) || 0;
    return `${serviceId}-${serviceVersion}`;
  };

  private renderServiceSectionHeader = (info: {
    section: SectionListData<string>;
  }): React.ReactElement<any> | null => (
    <ListItem itemHeader={true}>
      <H2>{info.section.title}</H2>
    </ListItem>
  );

  private renderServiceItem: ListRenderItem<string> = (
    itemInfo: ListRenderItemInfo<string>
  ) => {
    const serviceId = itemInfo.item;
    const service = this.props.services.byId[serviceId];
    const onPress = () => {
      this.props.dispatch(contentServiceLoad(serviceId));
      const params: IMessageDetailsScreenParam = {
        serviceId
      };
      this.props.navigation.navigate(ROUTES.PREFERENCES_SERVICE_DETAIL, params);
    };
    return (
      service && (
        <ListItem key={itemInfo.item} onPress={onPress}>
          <Left>
            <H3>{service.service_name}</H3>
          </Left>
          <Right>
            <IconFont name="io-right" />
          </Right>
        </ListItem>
      )
    );
  };

  public render() {
    // tslint:disable-next-line:readonly-array
    const sections: Array<SectionListData<string>> = Object.keys(
      this.props.services.byOrgFiscalCode
    ).map(fiscalCode => {
      const title = this.props.organizations[fiscalCode] || fiscalCode;
      // tslint:disable-next-line:readonly-array
      const data: string[] = (this.props.services.byOrgFiscalCode[fiscalCode] ||
        []) as any;
      return {
        title,
        data
      };
    });

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("services.headerTitle")}</Text>
          </Body>
        </AppHeader>

        <Content>
          <DefaultSubscreenHeader screenTitle={I18n.t("services.title")} />
          <Text>{I18n.t("services.subtitle")}</Text>
          <View spacer={true} />
          <View>
            <SectionList
              sections={sections}
              renderItem={this.renderServiceItem}
              renderSectionHeader={this.renderServiceSectionHeader}
              keyExtractor={this.getServiceKey}
              alwaysBounceVertical={false}
            />
          </View>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  services: state.entities.services,
  organizations: state.entities.organizations
});

export default connect(mapStateToProps)(ServicesScreen);
