import { Grid, H3, Left, ListItem, Right, Row, Text } from "native-base";
import * as React from "react";
import {
  ListRenderItem,
  ListRenderItemInfo,
  SectionListData,
  StyleSheet
} from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";

import IconFont from "../../components/ui/IconFont";

import ROUTES from "../../navigation/routes";

import { contentServiceLoad } from "../../store/actions/content";
import { ReduxProps } from "../../store/actions/types";
import { OrganizationNamesByFiscalCodeState } from "../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
import { ServicesState } from "../../store/reducers/entities/services";
import { ProfileState } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

import { IMessageDetailsScreenParam } from "./ServiceDetailsScreen";

import { getEnabledChannelsForService } from "./common";

import { isDefined } from "../../utils/guards";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import H4 from "../../components/ui/H4";
import Markdown from "../../components/ui/Markdown";
import { SectionList } from "../../components/ui/SectionList";
import variables from "../../theme/variables";

const styles = StyleSheet.create({
  fixCroppedItalic: {
    // Leave a little bit of space in order to avoid cropped characters
    // due to italic style.
    paddingRight: variables.fontSizeBase / 3
  },
  serviceName: {
    color: variables.brandDarkGray
  }
});

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
      <H3>{info.section.title}</H3>
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
      // screen, we issue a contentServiceLoad to refresh the service metadata
      this.props.dispatch(contentServiceLoad(service.service_id));

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
                <H4 style={styles.serviceName}>{service.service_name}</H4>
              </Row>
              <Row>
                <Text italic={true} style={styles.fixCroppedItalic}>
                  {enabledChannels.inbox
                    ? I18n.t("services.serviceIsEnabled")
                    : I18n.t("services.serviceNotEnabled")}
                </Text>
              </Row>
            </Grid>
          </Left>
          <Right>
            <IconFont name="io-right" color={variables.brandPrimary} />
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
        title={I18n.t("services.title")}
        goBack={this.goBack}
        subtitle={I18n.t("services.subTitle")}
        contextualHelp={{
          title: I18n.t("services.title"),
          body: () => <Markdown>{I18n.t("services.servicesHelp")}</Markdown>
        }}
      >
        <SectionList
          sections={sections}
          renderItem={this.renderServiceItem}
          renderSectionHeader={this.renderServiceSectionHeader}
          keyExtractor={this.getServiceKey}
          stickySectionHeadersEnabled={false}
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
