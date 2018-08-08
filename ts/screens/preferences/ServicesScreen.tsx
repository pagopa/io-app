import { Grid, H1, H3, Left, ListItem, Right, Row, Text } from "native-base";
import * as React from "react";
import {
  ListRenderItem,
  ListRenderItemInfo,
  SectionList,
  SectionListData
} from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";

import IconFont from "../../components/ui/IconFont";

import ROUTES from "../../navigation/routes";

import {
  contentOrganizationLoad,
  contentServiceLoad
} from "../../store/actions/content";
import { ReduxProps } from "../../store/actions/types";
import { OrganizationNamesByFiscalCodeState } from "../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
import { ServicesState } from "../../store/reducers/entities/services";
import { ProfileState } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

import { IMessageDetailsScreenParam } from "./ServiceDetailsScreen";

import { getEnabledChannelsForService } from "./common";

import { isDefined } from "../../utils/guards";

import TopScreenComponent from "../../components/screens/TopScreenComponent";

type ReduxMappedProps = Readonly<{
  profile: ProfileState;
  services: ServicesState;
  organizations: OrganizationNamesByFiscalCodeState;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = ReduxMappedProps & ReduxProps & OwnProps;

class ServicesScreen extends React.PureComponent<Props> {
  private goBack = () => this.props.navigation.goBack();

  private getServiceKey = (service: ServicePublic): string => {
    return `${service.service_id}-${service.version || 0}`;
  };

  private renderServiceSectionHeader = (info: {
    section: SectionListData<string>;
  }): React.ReactElement<any> | null => (
    <ListItem itemHeader={true}>
      <H1>{info.section.title}</H1>
    </ListItem>
  );

  private renderServiceItem: ListRenderItem<ServicePublic> = (
    itemInfo: ListRenderItemInfo<ServicePublic>
  ) => {
    const service = itemInfo.item;
    const enabledChannels = getEnabledChannelsForService(
      this.props.profile,
      service.service_id
    );

    const onPress = () => {
      // when a service gets selected, before navigating to the service detail
      // screen, we issue a contentServiceLoad and a contentOrganizationLoad
      // to refresh the service and organization metadata
      this.props.dispatch(contentServiceLoad(service.service_id));
      this.props.dispatch(
        contentOrganizationLoad(service.organization_fiscal_code)
      );
      const params: IMessageDetailsScreenParam = {
        service
      };
      this.props.navigation.navigate(ROUTES.PREFERENCES_SERVICE_DETAIL, params);
    };
    return (
      service && (
        <ListItem key={service.service_id} onPress={onPress}>
          <Left>
            <Grid>
              <Row>
                <H3>{service.service_name}</H3>
              </Row>
              <Row>
                <Text italic={true} bold={enabledChannels.inbox}>
                  {enabledChannels.inbox
                    ? I18n.t("services.serviceIsEnabled")
                    : I18n.t("services.serviceNotEnabled")}
                </Text>
              </Row>
            </Grid>
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
      const serviceIds = this.props.services.byOrgFiscalCode[fiscalCode] || [];
      const services = serviceIds
        .map(id => this.props.services.byId[id])
        .filter(isDefined);
      return {
        title,
        data: services as any[] // tslint:disable-line:readonly-array
      };
    });

    return (
      <TopScreenComponent
        title={I18n.t("services.headerTitle")}
        goBack={this.goBack}
        subtitle={I18n.t("services.subtitle")}
      >
        <SectionList
          sections={sections}
          renderItem={this.renderServiceItem}
          renderSectionHeader={this.renderServiceSectionHeader}
          keyExtractor={this.getServiceKey}
          alwaysBounceVertical={false}
        />
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  profile: state.profile,
  services: state.entities.services,
  organizations: state.entities.organizations
});

export default connect(mapStateToProps)(ServicesScreen);
