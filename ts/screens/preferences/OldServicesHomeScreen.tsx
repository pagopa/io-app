/**
 * Screen displaying the list of available services. The user can
 * access the service detail by pressing on the related list item.
 */
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

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
import { profileUpsert } from "../../store/actions/profile";
import { loadVisibleServices } from "../../store/actions/services";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { ProfileState } from "../../store/reducers/profile";
import {
  isSearchServicesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import { InferNavigationParams } from "../../types/react";
import { isDefined } from "../../utils/guards";
import { getChannelsforServicesList } from "./common";
import OldServiceDetailsScreen from "./OldServiceDetailsScreen";

type OwnProps = NavigationInjectedProps;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
  OwnProps;

class OldServicesHomeScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private onServiceSelect = (service: ServicePublic) => {
    // when a service gets selected, before navigating to the service detail
    // screen, we issue a contentServiceLoad to refresh the service metadata
    this.props.contentServiceLoad(service.service_id);
    this.props.navigateToOldServiceDetailsScreen({
      service
    });
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
      <ServiceSectionListComponent
        sections={sections}
        profile={this.props.profile}
        isRefreshing={this.props.isLoading}
        onRefresh={this.props.refreshServices}
        onSelect={this.onServiceSelect}
      />
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
            />
          )
      )
      .getOrElse(<SearchNoResultMessage errorType="InvalidSearchBarText" />);
  };
}

const servicesSelector = (state: GlobalState) => state.entities.services;
const organizationsSelector = (state: GlobalState) =>
  state.entities.organizations;

export const getAllSections = createSelector(
  [servicesSelector, organizationsSelector],
  (services, organizations) => {
    const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);
    return orgfiscalCodes
      .map(fiscalCode => {
        const title = organizations[fiscalCode] || fiscalCode;
        const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];
        const data = serviceIdsForOrg
          .map(id => services.byId[id])
          .filter(isDefined);
        return {
          title,
          data
        };
      })
      .filter(_ => _.data.length > 0)
      .sort((a, b) => (a.title || "").localeCompare(b.title));
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
      state.persistedPreferences.isExperimentalFeaturesEnabled
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshServices: () => dispatch(loadVisibleServices.request()),
  contentServiceLoad: (serviceId: ServiceId) =>
    dispatch(contentServiceLoad.request(serviceId)),
  navigateToOldServiceDetailsScreen: (
    params: InferNavigationParams<typeof OldServiceDetailsScreen>
  ) => dispatch(navigateToOldServiceDetailsScreen(params)),

  /**
   * TODO: restyle ui to trigger all the services being enabled/disabled at once
   *       https://www.pivotaltracker.com/n/projects/2048617/stories/166763719
   */
  disableAllServices: (
    allServicesId: ReadonlyArray<string>,
    profile: ProfileState
  ) => {
    const newBlockedChannels = getChannelsforServicesList(
      allServicesId,
      profile,
      false
    );
    dispatch(
      profileUpsert.request({
        blocked_inbox_or_channels: newBlockedChannels
      })
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OldServicesHomeScreen);
