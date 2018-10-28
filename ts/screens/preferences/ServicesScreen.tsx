import { Grid, H3, Left, ListItem, Right, Row, Text } from "native-base";
import * as React from "react";
import { ListRenderItemInfo, SectionListData, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";

import IconFont from "../../components/ui/IconFont";

import { contentServiceLoad } from "../../store/actions/content";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { ProfileState } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

import { getEnabledChannelsForService } from "./common";

import { isDefined } from "../../utils/guards";

import { ServiceId } from "../../../definitions/backend/ServiceId";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import H4 from "../../components/ui/H4";
import Markdown from "../../components/ui/Markdown";
import { SectionList } from "../../components/ui/SectionList";
import { navigateToServiceDetailsScreen } from "../../store/actions/navigation";
import { loadVisibleServicesRequest } from "../../store/actions/services";
import variables from "../../theme/variables";
import * as pot from "../../types/pot";
import { InferNavigationParams } from "../../types/react";
import ServiceDetailsScreen from "./ServiceDetailsScreen";

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

type ReduxMappedStateProps = Readonly<{
  profile: ProfileState;
  // tslint:disable-next-line:readonly-array
  sections: Array<SectionListData<pot.Pot<ServicePublic, Error>>>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  loadVisibleServices: () => void;
  contentServiceLoad: (serviceId: ServiceId) => void;
  navigateToServiceDetailsScreen: (
    params: InferNavigationParams<typeof ServiceDetailsScreen>
  ) => void;
}>;

type OwnProps = NavigationInjectedProps;

type Props = ReduxMappedStateProps &
  ReduxMappedDispatchProps &
  ReduxProps &
  OwnProps;

class ServicesScreen extends React.Component<Props> {
  private goBack = () => this.props.navigation.goBack();

  private getServiceKey = (
    potService: pot.Pot<ServicePublic, Error>,
    index: number
  ): string => {
    return pot.getOrElse(
      pot.map(
        potService,
        service => `${service.service_id}-${service.version || 0}`
      ),
      `service-pot-${index}`
    );
  };

  private renderServiceSectionHeader = (info: {
    section: SectionListData<pot.Pot<ServicePublic, Error>>;
  }): React.ReactElement<any> | null => (
    <ListItem itemHeader={true}>
      <H3>{info.section.title}</H3>
    </ListItem>
  );

  private renderServiceItem = (
    itemInfo: ListRenderItemInfo<pot.Pot<ServicePublic, Error>>
  ) => {
    const potService = itemInfo.item;
    const enabledChannels = pot.map(potService, service =>
      getEnabledChannelsForService(this.props.profile, service.service_id)
    );

    const onPress = pot.toUndefined(
      pot.map(potService, service => () => {
        // when a service gets selected, before navigating to the service detail
        // screen, we issue a contentServiceLoad to refresh the service metadata
        this.props.contentServiceLoad(service.service_id);
        this.props.navigateToServiceDetailsScreen({
          service
        });
      })
    );

    const serviceName = pot.isLoading(potService)
      ? I18n.t("global.remoteStates.loading")
      : pot.isError(potService) || pot.isNone(potService)
        ? I18n.t("global.remoteStates.notAvailable")
        : potService.value.service_name;

    const inboxEnabledLabel = pot.map(
      enabledChannels,
      _ =>
        _.inbox
          ? I18n.t("services.serviceIsEnabled")
          : I18n.t("services.serviceNotEnabled")
    );

    return (
      <ListItem onPress={onPress}>
        <Left>
          <Grid>
            <Row>
              <H4 style={styles.serviceName}>{serviceName}</H4>
            </Row>
            <Row>
              <Text italic={true} style={styles.fixCroppedItalic}>
                {pot.getOrElse(inboxEnabledLabel, "")}
              </Text>
            </Row>
          </Grid>
        </Left>
        <Right>
          <IconFont name="io-right" color={variables.brandPrimary} />
        </Right>
      </ListItem>
    );
  };

  public componentDidMount() {
    // on mount, update visible services
    this.props.loadVisibleServices();
  }

  public render() {
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
          sections={this.props.sections}
          renderItem={this.renderServiceItem}
          renderSectionHeader={this.renderServiceSectionHeader}
          keyExtractor={this.getServiceKey}
          stickySectionHeadersEnabled={false}
          alwaysBounceVertical={false}
          withContentLateralPadding={true}
        />
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => {
  const { services, organizations } = state.entities;

  const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);

  // tslint:disable-next-line:readonly-array
  const sections = orgfiscalCodes.map(fiscalCode => {
    const title = organizations[fiscalCode] || fiscalCode;
    const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];
    const data = serviceIdsForOrg
      .map(id => services.byId[id])
      .filter(isDefined);
    return {
      title,
      data
    };
  });
  return {
    profile: state.profile,
    sections
  };
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  loadVisibleServices: () => dispatch(loadVisibleServicesRequest()),
  contentServiceLoad: (serviceId: ServiceId) =>
    dispatch(contentServiceLoad(serviceId)),
  navigateToServiceDetailsScreen: (
    params: InferNavigationParams<typeof ServiceDetailsScreen>
  ) => dispatch(navigateToServiceDetailsScreen(params))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesScreen);
