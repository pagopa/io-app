/**
 * Screen displaying the list of available services. The user can
 * access the service detail by pressing on the related list item.
 */
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { NavigationEvents, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
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
import {
  navigateToServiceDetailsScreen,
  navigateToServicesHomeScreen
} from "../../store/actions/navigation";
import { loadVisibleServices } from "../../store/actions/services";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import {
  isSearchServicesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import { InferNavigationParams } from "../../types/react";
import { isDefined } from "../../utils/guards";
import ServiceDetailsScreen from "./ServiceDetailsScreen";

type OwnProps = NavigationInjectedProps;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
  OwnProps;

class ServicesScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private onServiceSelect = (service: ServicePublic) => {
    // when a service gets selected, before navigating to the service detail
    // screen, we issue a contentServiceLoad to refresh the service metadata
    this.props.contentServiceLoad(service.service_id);
    this.props.navigateToServiceDetailsScreen({
      service
    });
  };

  public componentWillMount() {
    this.checkForExperimentalFeatures();
  }

  private handleWillFocus = () => {
    this.checkForExperimentalFeatures();
  };

  private checkForExperimentalFeatures() {
    const { isExperimentalFeaturesEnabled } = this.props;
    // If experimental features are enabled go to the new services home
    if (isExperimentalFeaturesEnabled) {
      this.props.navigateToServiceHomeScreen();
    }
  }

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
        <NavigationEvents onWillFocus={this.handleWillFocus} />
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

const mapStateToProps = (state: GlobalState) => {
  const { services, organizations } = state.entities;

  const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);

  // tslint:disable-next-line:readonly-array
  const sections = orgfiscalCodes
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
    .filter(_ => _.data.length > 0);

  const isAnyServiceLoading =
    Object.keys(services.byId).find(k => {
      const oneService = services.byId[k];
      return oneService !== undefined && pot.isLoading(oneService);
    }) !== undefined;

  const isLoading =
    pot.isLoading(state.entities.services.visible) || isAnyServiceLoading;

  return {
    profile: state.profile,
    sections,
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
  navigateToServiceDetailsScreen: (
    params: InferNavigationParams<typeof ServiceDetailsScreen>
  ) => dispatch(navigateToServiceDetailsScreen(params)),
  navigateToServiceHomeScreen: () => dispatch(navigateToServicesHomeScreen())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesScreen);
