/**
 * A screen that contains all the available servives.
 * - Local tab: services sections related to the areas of interest selected by the user
 * - National tab: national services sections
 * - All: local and national services sections, not including the user areas of interest
 *
 * A 'loading component' is displayed (hiding the tabs content) if:
 * - visible servcices are loading, or
 * - userMetadata is loading, or
 * - servicesByScope is loading
 *
 * An 'error component' is displayed (hiding the tabs content) if:
 * - userMetadata load fails, or
 * - visible services load fails
 *
 * A loader on tabs is displayed (not hiding the tabs content) if:
 * - userMetadata is updating, or
 * - visible services are refreshed
 *
 * If toastContent is undefined, when userMetadata/visible services are loading/error,
 * tabs are hidden and they are displayed renderServiceLoadingPlaceholder/renderErrorPlaceholder
 *
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBText } from "native-base";
import * as React from "react";
import {
  View,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Label } from "../../components/core/typography/Label";
import { IOColors } from "../../components/core/variables/IOColors";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import GenericErrorComponent from "../../components/screens/GenericErrorComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import SectionStatusComponent from "../../components/SectionStatus";
import ServicesSearch from "../../components/services/ServicesSearch";
import TouchableDefaultOpacity from "../../components/TouchableDefaultOpacity";
import FocusAwareStatusBar from "../../components/ui/FocusAwareStatusBar";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n from "../../i18n";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import ServicesHomeTabNavigator from "../../navigation/ServicesHomeTabNavigator";
import {
  navigateToServiceDetailsScreen,
  navigateToServicePreferenceScreen
} from "../../store/actions/navigation";
import { profileUpsert } from "../../store/actions/profile";
import {
  loadVisibleServices,
  showServiceDetails
} from "../../store/actions/services";
import { Dispatch } from "../../store/actions/types";
import {
  userMetadataLoad,
  userMetadataUpsert
} from "../../store/actions/userMetadata";
import {
  nationalServicesSectionsSelector,
  notSelectedServicesSectionsSelector,
  selectedLocalServicesSectionsSelector,
  ServicesSectionState,
  servicesSelector,
  visibleServicesDetailLoadStateSelector
} from "../../store/reducers/entities/services";
import { readServicesByIdSelector } from "../../store/reducers/entities/services/readStateByServiceId";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { visibleServicesSelector } from "../../store/reducers/entities/services/visibleServices";
import { wasServiceAlertDisplayedOnceSelector } from "../../store/reducers/persistedPreferences";
import { profileSelector, ProfileState } from "../../store/reducers/profile";
import {
  isSearchServicesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import {
  UserMetadata,
  userMetadataSelector
} from "../../store/reducers/userMetadata";
import customVariables from "../../theme/variables";
import { HEADER_HEIGHT } from "../../utils/constants";
import {
  getChannelsforServicesList,
  getProfileChannelsforServicesList
} from "../../utils/profile";
import { showToast } from "../../utils/showToast";
import { ServiceDetailsScreenNavigationParams } from "./ServiceDetailsScreen";

type OwnProps = IOStackNavigationRouteProps<AppParamsList>;

type ReduxMergedProps = Readonly<{
  updateOrganizationsOfInterestMetadata: (
    selectedItemIds: O.Option<Set<string>>
  ) => void;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps &
  ReduxMergedProps &
  LightModalContextInterface;

type State = {
  currentTab: number;
  currentTabServicesId: ReadonlyArray<string>;
  isLongPressEnabled: boolean;
  enableServices: boolean;
  toastErrorMessage: string;
  isInnerContentRendered: boolean;
};

type DataLoadFailure =
  | "servicesLoadFailure"
  | "userMetadaLoadFailure"
  | undefined;

const customSpacerHeight = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topScreenContainer: {
    flex: 1,
    justifyContent: "flex-end"
  },
  center: {
    alignItems: "center"
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  customSpacer: {
    height: customSpacerHeight
  },
  headerLinkContainer: {
    flexDirection: "row",
    alignItems: "center"
  }
});

const AnimatedScreenContentHeader =
  Animated.createAnimatedComponent(ScreenContentHeader);
const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "services.contextualHelpTitle",
  body: "services.contextualHelpContent"
};

class ServicesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0,
      currentTabServicesId: [],
      isLongPressEnabled: false,
      enableServices: false,
      toastErrorMessage: I18n.t("global.genericError"),
      isInnerContentRendered: false
    };
  }

  /**
   * return true if all services have INBOX channel disabled
   */
  private areAllServicesInboxChannelDisabled = (): boolean => {
    const currentTabServicesChannels = this.props.getServicesChannels(
      this.props.tabsServicesId[this.state.currentTab],
      this.props.profile
    );

    const disabledServices: number = Object.keys(
      currentTabServicesChannels
    ).filter(
      id => currentTabServicesChannels[id].indexOf("INBOX") !== -1
    ).length;

    return (
      disabledServices > 0 &&
      disabledServices === Object.keys(currentTabServicesChannels).length
    );
  };

  /**
   * if we are displaying the loading screen and we got no errors on loading
   * data, then we can show the content
   */
  private canRenderContent = () => {
    if (
      !this.state.isInnerContentRendered &&
      pot.isSome(this.props.visibleServicesContentLoadState) &&
      this.props.loadDataFailure === undefined
    ) {
      this.setState({ isInnerContentRendered: true });
    }
  };

  public componentDidMount() {
    // On mount, update visible services and user metadata if their
    // refresh fails
    if (pot.isError(this.props.potUserMetadata)) {
      this.props.refreshUserMetadata();
    }

    this.canRenderContent();

    if (pot.isError(this.props.visibleServicesContentLoadState)) {
      this.props.refreshVisibleServices();
    }
  }

  private animatedTabScrollPositions: ReadonlyArray<Animated.Value> = [
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  private getHeaderHeight = (): Animated.AnimatedInterpolation =>
    this.animatedTabScrollPositions[this.state.currentTab].interpolate({
      inputRange: [0, HEADER_HEIGHT],
      outputRange: [0, 1],
      extrapolate: "clamp"
    });

  // TODO: evaluate if it can be replaced by the component introduced within https://www.pivotaltracker.com/story/show/168247501
  private renderServiceLoadingPlaceholder() {
    return (
      <View style={[styles.center, styles.padded, IOStyles.flex]}>
        {Platform.OS === "ios" && <View style={styles.customSpacer} />}
        <VSpacer size={40} />
        <VSpacer size={40} />
        <Image
          source={require("../../../img/services/icon-loading-services.png")}
        />
        <VSpacer size={40} />
        <NBText bold={true}>{I18n.t("services.loading.title")}</NBText>
        <NBText>{I18n.t("services.loading.subtitle")}</NBText>
      </View>
    );
  }

  // eslint-disable-next-line
  public componentDidUpdate(prevProps: Props, prevState: State) {
    // if some errors occur while updating profile, we will show a message in a toast
    // profile could be updated by enabling/disabling on or more channel of a service
    if (pot.isError(this.props.profile) && !pot.isError(prevProps.profile)) {
      showToast(
        I18n.t("serviceDetail.onUpdateEnabledChannelsFailure"),
        "danger"
      );
    }

    const enableServices = this.areAllServicesInboxChannelDisabled();
    if (enableServices !== prevState.enableServices) {
      this.setState({ enableServices });
    }

    this.canRenderContent();

    if (this.state.isInnerContentRendered) {
      if (
        pot.isError(this.props.potUserMetadata) &&
        (pot.isUpdating(prevProps.potUserMetadata) ||
          pot.isLoading(prevProps.potUserMetadata))
      ) {
        // A toast is displayed if upsert userMetadata load fails
        showToast(this.state.toastErrorMessage, "danger");
      }

      if (
        pot.isLoading(prevProps.visibleServicesContentLoadState) &&
        pot.isError(this.props.visibleServicesContentLoadState)
      ) {
        // A toast is displayed if refresh visible services fails (on content or metadata load)
        showToast(this.state.toastErrorMessage, "danger");
      }
    }
  }

  private onServiceSelect = (service: ServicePublic) => {
    // when a service gets selected the service is recorded as read
    this.props.serviceDetailsLoad(service);
    this.props.navigateToServiceDetailsScreen({
      serviceId: service.service_id
    });
  };

  private renderErrorContent = () => {
    if (this.state.isInnerContentRendered) {
      return undefined;
    }

    switch (this.props.loadDataFailure) {
      case "userMetadaLoadFailure":
        return (
          <GenericErrorComponent
            onRetry={() => this.refreshScreenContent(true)}
          />
        );
      case "servicesLoadFailure":
        return <GenericErrorComponent onRetry={this.refreshScreenContent} />;
      default:
        return undefined;
    }
  };

  private renderInnerContent = () => {
    if (this.state.isInnerContentRendered) {
      return this.renderTabs();
    } else {
      return this.renderServiceLoadingPlaceholder();
    }
  };

  private renderHeaderLink = () => (
    <TouchableDefaultOpacity
      style={styles.headerLinkContainer}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={I18n.t("services.accessibility.edit")}
      onPress={this.props.navigateToServicePreference}
    >
      <IconFont name={"io-coggle"} size={16} color={IOColors.blue} />
      <Label color={"blue"} weight={"Bold"} style={{ marginLeft: 8 }}>
        {I18n.t("global.buttons.edit").toLocaleUpperCase()}
      </Label>
    </TouchableDefaultOpacity>
  );

  public render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={true}
        style={styles.container}
      >
        <View style={styles.topScreenContainer}>
          <FocusAwareStatusBar
            barStyle={"dark-content"}
            backgroundColor={IOColors.white}
          />
          <TopScreenComponent
            accessibilityLabel={I18n.t("services.title")}
            headerTitle={I18n.t("services.title")}
            appLogo={true}
            contextualHelpMarkdown={contextualHelpMarkdown}
            faqCategories={["services"]}
          >
            {this.renderErrorContent() ? (
              this.renderErrorContent()
            ) : this.props.isSearchEnabled ? (
              this.renderSearch()
            ) : (
              <React.Fragment>
                <AnimatedScreenContentHeader
                  title={I18n.t("services.title")}
                  rightComponent={this.renderHeaderLink()}
                  dynamicHeight={this.getHeaderHeight()}
                />
                {this.renderInnerContent()}
              </React.Fragment>
            )}
          </TopScreenComponent>
        </View>
        <SectionStatusComponent sectionKey={"services"} />
      </KeyboardAvoidingView>
    );
  }

  /**
   * Render ServicesSearch component.
   */
  private renderSearch = () =>
    pipe(
      this.props.searchText,
      O.map(_ =>
        _.length < MIN_CHARACTER_SEARCH_TEXT ? (
          <SearchNoResultMessage errorType={"InvalidSearchBarText"} />
        ) : (
          <ServicesSearch
            sectionsState={this.props.allSections}
            onRefresh={this.refreshServices}
            navigateToServiceDetail={this.onServiceSelect}
            searchText={_}
          />
        )
      ),
      O.getOrElse(() => (
        <SearchNoResultMessage errorType={"InvalidSearchBarText"} />
      ))
    );

  private refreshServices = () => {
    this.setState({
      toastErrorMessage: I18n.t("global.genericError")
    });
    this.props.refreshVisibleServices();
  };

  private refreshScreenContent = (hideToast: boolean = false) => {
    if (!hideToast) {
      this.setState({ toastErrorMessage: I18n.t("global.genericError") });
    }
    this.props.refreshUserMetadata();
    this.props.refreshVisibleServices();
  };

  /**
   * Render Locals, Nationals and Other services tabs.
   */
  private renderTabs = () => (
    <View style={IOStyles.flex}>
      <ServicesHomeTabNavigator />
    </View>
  );
}

const mapStateToProps = (state: GlobalState) => {
  const potUserMetadata = userMetadataSelector(state);
  const userMetadata = pot.getOrElse(potUserMetadata, undefined);

  const localTabSections = selectedLocalServicesSectionsSelector(state);
  const nationalTabSections = nationalServicesSectionsSelector(state);
  const allTabSections = notSelectedServicesSectionsSelector(state);

  // All visibile services organized in sections
  const allSections: ReadonlyArray<ServicesSectionState> = [
    ...localTabSections,
    ...allTabSections
  ];

  const getTabSevicesId = (tabServices: ReadonlyArray<ServicesSectionState>) =>
    tabServices.reduce(
      (acc: ReadonlyArray<string>, curr: ServicesSectionState) => {
        const sectionServices = curr.data.reduce(
          (
            acc2: ReadonlyArray<string>,
            curr2: pot.Pot<ServicePublic, Error>
          ) => {
            if (pot.isSome(curr2)) {
              return [...acc2, curr2.value.service_id];
            }
            return acc2;
          },
          []
        );
        return [...acc, ...sectionServices];
      },
      []
    );

  const tabsServicesId: { [k: number]: ReadonlyArray<string> } = {
    [0]: getTabSevicesId(nationalTabSections),
    [1]: getTabSevicesId(localTabSections),
    [2]: getTabSevicesId(allTabSections)
  };

  const visibleServicesContentLoadState =
    visibleServicesDetailLoadStateSelector(state);

  const isLoadingServices = pot.isLoading(visibleServicesContentLoadState);

  const servicesLoadingFailure =
    !pot.isLoading(potUserMetadata) &&
    pot.isError(visibleServicesContentLoadState);

  const loadDataFailure: DataLoadFailure = pot.isError(potUserMetadata)
    ? "userMetadaLoadFailure"
    : servicesLoadingFailure
    ? "servicesLoadFailure"
    : undefined;

  return {
    debugONLYServices: servicesSelector(state),
    isLoadingServices,
    visibleServicesContentLoadState,
    loadDataFailure,
    profile: profileSelector(state),
    visibleServices: visibleServicesSelector(state),
    readServices: readServicesByIdSelector(state),
    allSections,
    localTabSections,
    nationalTabSections,
    allTabSections,
    tabsServicesId,
    wasServiceAlertDisplayedOnce: wasServiceAlertDisplayedOnceSelector(state),
    servicesById: servicesByIdSelector(state),
    potUserMetadata,
    userMetadata,
    isSearchEnabled: isSearchServicesEnabledSelector(state),
    searchText: searchTextSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToServicePreference: () => navigateToServicePreferenceScreen(),
  refreshUserMetadata: () => dispatch(userMetadataLoad.request()),
  refreshVisibleServices: () => dispatch(loadVisibleServices.request()),
  getServicesChannels: (
    servicesId: ReadonlyArray<string>,
    profile: ProfileState
  ) => getChannelsforServicesList(servicesId, profile),
  disableOrEnableServices: (
    servicesId: ReadonlyArray<string>,
    profile: ProfileState,
    enable: boolean
  ) => {
    const newBlockedChannels = getProfileChannelsforServicesList(
      servicesId,
      profile,
      enable
    );
    dispatch(
      profileUpsert.request({
        blocked_inbox_or_channels: newBlockedChannels
      })
    );
  },
  saveSelectedOrganizationItems: (
    userMetadata: UserMetadata,
    selectedItemIds: ReadonlyArray<string>
  ) => {
    const metadata = userMetadata.metadata;
    const currentVersion: number = userMetadata.version;
    dispatch(
      userMetadataUpsert.request({
        ...userMetadata,
        version: currentVersion + 1,
        metadata: {
          ...metadata,
          organizationsOfInterest: selectedItemIds
        }
      })
    );
  },
  navigateToServiceDetailsScreen: (
    params: ServiceDetailsScreenNavigationParams
  ) => navigateToServiceDetailsScreen(params),
  serviceDetailsLoad: (service: ServicePublic) =>
    dispatch(showServiceDetails(service))
});

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>,
  ownProps: OwnProps
) => {
  // If the user updates the area of interest, the upsert of
  // the user metadata stored on backend is triggered
  const updateOrganizationsOfInterestMetadata = (
    selectedItemIds: O.Option<Set<string>>
  ) => {
    if (O.isSome(selectedItemIds) && stateProps.userMetadata) {
      const updatedAreasOfInterest = Array.from(selectedItemIds.value);
      dispatchProps.saveSelectedOrganizationItems(
        stateProps.userMetadata,
        updatedAreasOfInterest
      );
    }
  };

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    ...{
      updateOrganizationsOfInterestMetadata
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withLightModalContext(ServicesHomeScreen));
