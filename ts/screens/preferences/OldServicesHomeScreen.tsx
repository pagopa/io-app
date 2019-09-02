/**
 * Screen displaying the list of available services. The user can
 * access the service detail by pressing on the related list item.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text, View } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { Alert, StyleSheet } from "react-native";
import { createSelector } from "reselect";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import ServiceSectionListComponent from "../../components/services/ServiceSectionListComponent";
import ServicesSearch from "../../components/services/ServicesSearch";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { contentServiceLoad } from "../../store/actions/content";
import { navigateToOldServiceDetailsScreen } from "../../store/actions/navigation";
import { serviceAlertDisplayedOnceSuccess } from "../../store/actions/persistedPreferences";
import { profileUpsert } from "../../store/actions/profile";
import {
  loadVisibleServices,
  showServiceDetails
} from "../../store/actions/services";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { readServicesByIdSelector } from "../../store/reducers/entities/services/readStateByServiceId";

import { organizationNamesByFiscalCodeSelector } from "../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
import { ProfileState } from "../../store/reducers/profile";
import {
  isSearchServicesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { InferNavigationParams } from "../../types/react";
import { isDefined } from "../../utils/guards";
import {
  getChannelsforServicesList,
  getEnabledChannelsForService
} from "./common";
import OldServiceDetailsScreen from "./OldServiceDetailsScreen";

type State = {
  enableServices: boolean;
  isLongPressEnabled: boolean;
};

type OwnProps = NavigationInjectedProps;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
  OwnProps;

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },
  listContainer: {
    flex: 1
  },
  buttonBar: {
    flexDirection: "row",
    zIndex: 1,
    justifyContent: "space-around",
    backgroundColor: customVariables.colorWhite,
    padding: 10
  },
  buttonBarLeft: {
    flex: 2,
    marginEnd: 5
  },
  buttonBarRight: {
    flex: 2,
    marginStart: 5
  }
});

class OldServicesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      enableServices: false,
      isLongPressEnabled: false
    };
  }

  private onServiceSelect = (service: ServicePublic) => {
    // when a service gets selected, before navigating to the service detail
    // screen, we issue a contentServiceLoad to refresh the service metadata
    this.props.contentServiceLoad(service.service_id);
    this.props.serviceDetailsLoad(service);
    this.props.navigateToOldServiceDetailsScreen({
      service
    });
  };

  private onSwitch = (service: ServicePublic) => {
    const value = getEnabledChannelsForService(
      this.props.profile,
      service.service_id
    ).inbox;
    // check if the alert of disable service has not been shown already and if the service is active
    if (!this.props.wasServiceAlertDisplayedOnce && value) {
      this.showAlertOnDisableServices(
        I18n.t("services.disableTitle"),
        I18n.t("services.disableMsg"),
        () => {
          this.props.disableOrEnableServices(
            [service.service_id],
            this.props.profile,
            false
          );
        }
      );
    } else {
      this.props.disableOrEnableServices(
        [service.service_id],
        this.props.profile,
        !value
      );
    }
  };

  private setEnabledServices = () => {
    this.setState({ enableServices: !this.state.enableServices });
  };
  private handleOnLongPressItem = () => {
    this.setState({
      isLongPressEnabled: !this.state.isLongPressEnabled
    });
  };

  private showAlertOnDisableServices = (
    title: string,
    msg: string,
    onConfirmPress: () => void
  ) => {
    Alert.alert(
      title,
      msg,
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.ok"),
          style: "destructive",
          onPress: () => {
            onConfirmPress();
            // update the persisted preferences to remember the user read the alert
            this.props.updatePersistedPreference(true);
          }
        }
      ],
      { cancelable: false }
    );
  };

  // This method enable or disable services and update the enableServices props
  private disableOrEnableServices = () => {
    this.props.disableOrEnableServices(
      this.props.allServicesId,
      this.props.profile,
      this.state.enableServices
    );
    this.setEnabledServices();
  };

  public componentDidMount() {
    // on mount, update visible services
    this.props.refreshServices();
  }

  public render() {
    const { isSearchEnabled } = this.props;

    return (
      <TopScreenComponent
        title={I18n.t("services.title")}
        contextualHelp={{
          title: I18n.t("services.title"),
          body: () => <Markdown>{I18n.t("services.servicesHelp")}</Markdown>
        }}
        isSearchAvailable={true}
        searchType="Services"
        appLogo={true}
      >
        {!isSearchEnabled && (
          <ScreenContentHeader
            title={I18n.t("services.title")}
            subtitle={I18n.t("services.subTitle")}
            icon={require("../../../img/icons/service-icon.png")}
          />
        )}

        {isSearchEnabled ? this.renderSearch() : this.renderList()}
      </TopScreenComponent>
    );
  }

  private renderList = () => {
    const { sections } = this.props;
    return (
      <View style={styles.listWrapper}>
        <View style={styles.listContainer}>
          <ServiceSectionListComponent
            sections={sections}
            profile={this.props.profile}
            isRefreshing={this.props.isLoading}
            onRefresh={this.props.refreshServices}
            onSelect={this.onServiceSelect}
            readServices={this.props.readServices}
            isExperimentalFeaturesEnabled={
              this.props.isExperimentalFeaturesEnabled
            }
            onLongPressItem={this.handleOnLongPressItem}
            isLongPressEnabled={this.state.isLongPressEnabled}
            onSwitch={this.onSwitch}
          />
        </View>
        {this.state.isLongPressEnabled && (
          <View style={styles.buttonBar}>
            <Button
              block={true}
              bordered={true}
              onPress={this.handleOnLongPressItem}
              style={styles.buttonBarLeft}
            >
              <Text>{I18n.t("services.close")}</Text>
            </Button>
            <Button
              block={true}
              primary={true}
              style={styles.buttonBarRight}
              onPress={() => {
                if (!this.props.wasServiceAlertDisplayedOnce) {
                  this.showAlertOnDisableServices(
                    I18n.t("services.disableAllTitle"),
                    I18n.t("services.disableAllMsg"),
                    () => this.disableOrEnableServices()
                  );
                } else {
                  this.disableOrEnableServices();
                }
              }}
            >
              <Text>
                {this.state.enableServices
                  ? I18n.t("services.enableAll")
                  : I18n.t("services.disableAll")}
              </Text>
            </Button>
          </View>
        )}
      </View>
    );
  };

  /**
   * Render ServicesSearch component.
   */
  private renderSearch = () => {
    const { refreshServices, sections, searchText } = this.props;

    return searchText
      .map(
        _ =>
          _.length < MIN_CHARACTER_SEARCH_TEXT ? (
            <SearchNoResultMessage errorType="InvalidSearchBarText" />
          ) : (
            <ServicesSearch
              sectionsState={sections}
              profile={this.props.profile}
              onRefresh={refreshServices}
              navigateToServiceDetail={this.onServiceSelect}
              searchText={_}
              readServices={this.props.readServices}
              isExperimentalFeaturesEnabled={
                this.props.isExperimentalFeaturesEnabled
              }
              onLongPressItem={this.handleOnLongPressItem}
            />
          )
      )
      .getOrElse(<SearchNoResultMessage errorType="InvalidSearchBarText" />);
  };
}

const servicesSelector = (state: GlobalState) => state.entities.services;

export const getAllSections = createSelector(
  [servicesSelector, organizationNamesByFiscalCodeSelector],
  (services, organizations) => {
    const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);
    return orgfiscalCodes
      .map(fiscalCode => {
        const organizationName = organizations[fiscalCode] || fiscalCode;
        const organizationFiscalCode = fiscalCode;
        const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];
        const data = serviceIdsForOrg
          .map(id => services.byId[id])
          .filter(isDefined);
        return {
          organizationName,
          organizationFiscalCode,
          data
        };
      })
      .filter(_ => _.data.length > 0)
      .sort((a, b) =>
        a.organizationName
          .toLocaleLowerCase()
          .localeCompare(b.organizationName.toLocaleLowerCase())
      );
  }
);

const mapStateToProps = (state: GlobalState) => {
  const { services } = state.entities;

  const isAnyServiceLoading =
    Object.keys(services.byId).find(k => {
      const oneService = services.byId[k];
      return oneService !== undefined && pot.isLoading(oneService);
    }) !== undefined;

  const isLoading =
    pot.isLoading(state.entities.services.visible) || isAnyServiceLoading;

  return {
    profile: state.profile,
    allServicesId: Object.keys(services.byId),
    sections: getAllSections(state),
    isLoading,
    searchText: searchTextSelector(state),
    isSearchEnabled: isSearchServicesEnabledSelector(state),
    isExperimentalFeaturesEnabled:
      state.persistedPreferences.isExperimentalFeaturesEnabled,
    readServices: readServicesByIdSelector(state),
    wasServiceAlertDisplayedOnce:
      state.persistedPreferences.wasServiceAlertDisplayedOnce
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshServices: () => dispatch(loadVisibleServices.request()),
  contentServiceLoad: (serviceId: ServiceId) =>
    dispatch(contentServiceLoad.request(serviceId)),
  navigateToOldServiceDetailsScreen: (
    params: InferNavigationParams<typeof OldServiceDetailsScreen>
  ) => dispatch(navigateToOldServiceDetailsScreen(params)),
  serviceDetailsLoad: (service: ServicePublic) =>
    dispatch(showServiceDetails(service)),
  /**
   * TODO: restyle ui to trigger all the services being enabled/disabled at once
   *       https://www.pivotaltracker.com/n/projects/2048617/stories/166763719
   */
  disableOrEnableServices: (
    allServicesId: ReadonlyArray<string>,
    profile: ProfileState,
    enable: boolean
  ) => {
    const newBlockedChannels = getChannelsforServicesList(
      allServicesId,
      profile,
      enable
    );
    dispatch(
      profileUpsert.request({
        blocked_inbox_or_channels: newBlockedChannels
      })
    );
  },
  updatePersistedPreference: (value: boolean) => {
    dispatch(
      serviceAlertDisplayedOnceSuccess({
        wasServiceAlertDisplayedOnce: value
      })
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OldServicesHomeScreen);
