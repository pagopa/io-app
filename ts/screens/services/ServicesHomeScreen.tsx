/**
 * A screen that contains all the available servives.
 * - Local tab: services sections related to the areas of interest selected by the user
 * - National tab: national services sections
 * - All: local and national services sections, not including the user areas of interest
 *
 * A 'loading component' is displayed (hiding the tabs content) if:
 * - visible servcices are loading, or
 * - userMetadata are loading
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
 * TODO: fix graphycal issues at potUserMetadata or services refresh
 *       - https://www.pivotaltracker.com/story/show/169224363s
 *       - https://www.pivotaltracker.com/story/show/169262311
 */
import { left } from "fp-ts/lib/Either";
import { Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Content, Tab, Tabs, Text, View } from "native-base";
import * as React from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import {
  NavigationEvents,
  NavigationEventSubscription,
  NavigationScreenProps
} from "react-navigation";
import { connect } from "react-redux";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import ChooserListContainer from "../../components/ChooserListContainer";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import OrganizationLogo from "../../components/services/OrganizationLogo";
import ServicesSearch from "../../components/services/ServicesSearch";
import ServicesSectionsList from "../../components/services/ServicesSectionsList";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { navigateToServiceDetailsScreen } from "../../store/actions/navigation";
import { serviceAlertDisplayedOnceSuccess } from "../../store/actions/persistedPreferences";
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
import { Organization } from "../../store/reducers/entities/organizations/organizationsAll";
import {
  localServicesSectionsSelector,
  nationalServicesSectionsSelector,
  notSelectedServicesSectionsSelector,
  organizationsOfInterestSelector,
  selectedLocalServicesSectionsSelector,
  ServicesSectionState,
  visibleServicesContentLoadStateSelector,
  visibleServicesMetadataLoadStateSelector
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
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import { InferNavigationParams } from "../../types/react";
import { getLogoForOrganization } from "../../utils/organizations";
import {
  getChannelsforServicesList,
  getProfileChannelsforServicesList
} from "../../utils/profile";
import { showToast } from "../../utils/showToast";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";
import { isTextIncludedCaseInsensitive } from "../../utils/strings";
import ServiceDetailsScreen from "./ServiceDetailsScreen";

type OwnProps = NavigationScreenProps;

type ReduxMergedProps = Readonly<{
  dispatchUpdateOrganizationsOfInterestMetadata: (
    selectedItemIds: Option<Set<string>>
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
  enableHeaderAnimation: boolean;
  isLongPressEnabled: boolean;
  enableServices: boolean;
  toastErrorMessage: string;
  isInnerContentRendered: boolean;
};

type DataLoadFailure =
  | "servicesLoadFailure"
  | "userMetadaLoadFailure"
  | undefined;

const EMPTY_MESSAGE = "";

// Scroll range is directly influenced by floating header height
const SCROLL_RANGE_FOR_ANIMATION =
  customVariables.appHeaderHeight +
  (Platform.OS === "ios"
    ? isIphoneX()
      ? 18
      : getStatusBarHeight(true)
    : customVariables.spacerHeight);

const styles = StyleSheet.create({
  tabBarContainer: {
    elevation: 0,
    height: 40
  },
  tabBarContent: {
    fontSize: customVariables.fontSizeSmall
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.tabUnderlineColor,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  tabBarUnderlineActive: {
    height: customVariables.tabUnderlineHeight,
    // borders do not overlap eachother, but stack naturally
    marginBottom: -customVariables.tabUnderlineHeight,
    backgroundColor: customVariables.contentPrimaryBackground
  },
  searchDisableIcon: {
    color: customVariables.headerFontColor
  },
  organizationLogo: {
    marginBottom: 0
  },
  activeTextStyle: {
    ...makeFontStyleObject(Platform.select, "600"),
    fontSize: Platform.OS === "android" ? 16 : undefined,
    fontWeight: Platform.OS === "android" ? "normal" : "bold"
  },
  textStyle: {
    fontSize: customVariables.fontSizeSmall
  },
  center: {
    alignItems: "center"
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  customSpacer: {
    height: customVariables.spacerHeight + customVariables.h1LineHeight
  },
  errorText: {
    fontSize: customVariables.fontSize2,
    paddingTop: customVariables.contentPadding
  },
  errorText2: {
    fontSize: customVariables.fontSizeSmall
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
  },
  icon: {
    paddingHorizontal: (24 - 17) / 2 // (io-right icon width) - (io-trash icon width)
  }
});

const AnimatedTabs = Animated.createAnimatedComponent(Tabs);

class ServicesHomeScreen extends React.Component<Props, State> {
  private navListener?: NavigationEventSubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0,
      currentTabServicesId: [],
      enableHeaderAnimation: false,
      isLongPressEnabled: false,
      enableServices: false,
      toastErrorMessage: EMPTY_MESSAGE,
      isInnerContentRendered: false
    };
  }

  private updateLongPressButtonScope = () => {
    const currentTabServicesChannels = this.props.getServicesChannels(
      this.props.tabsServicesId[this.state.currentTab],
      this.props.profile
    );

    const disabledServices: number = Object.keys(
      currentTabServicesChannels
    ).filter(id => currentTabServicesChannels[id].indexOf("INBOX") !== -1)
      .length;

    if (disabledServices === Object.keys(currentTabServicesChannels).length) {
      // if all tab services are disabled the footer primary button allows services are massively enabled
      this.setState({ enableServices: true });
    } else {
      // if at least one tab service is enabled the footer primary button allows services are massively disabled
      this.setState({ enableServices: false });
    }
  };

  private handleOnLongPressItem = () => {
    if (!this.props.isSearchEnabled) {
      this.updateLongPressButtonScope();
      const isLongPressEnabled = !this.state.isLongPressEnabled;
      const currentTabServicesId = this.props.tabsServicesId[
        this.state.currentTab
      ];
      this.setState({
        isLongPressEnabled,
        currentTabServicesId
      });
    }
  };

  public componentDidMount() {
    // On mount, update visible services and user metadata if their
    // refresh fails
    if (pot.isError(this.props.potUserMetadata)) {
      this.props.refreshUserMetadata();
    }

    if (
      pot.isError(this.props.visibleServicesContentLoadState) ||
      pot.isError(this.props.visibleServicesMetadataLoadState)
    ) {
      this.props.refreshServices();
    }

    this.navListener = this.props.navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "dark-content",
        customVariables.colorWhite
      );
    }); // tslint:disable-line no-object-mutation
  }

  private animatedScrollPositions: ReadonlyArray<Animated.Value> = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  // tslint:disable-next-line: readonly-array
  private scollPositions: number[] = [0, 0, 0];

  // TODO: evaluate if it can be replaced by the component introduced within https://www.pivotaltracker.com/story/show/168247501
  private renderErrorPlaceholder(onRetry: () => void) {
    return (
      <React.Fragment>
        <Content bounces={false}>
          <View style={styles.center}>
            <View spacer={true} extralarge={true} />
            <Image
              source={require("../../../img/wallet/errors/generic-error-icon.png")}
            />
            <View spacer={true} />
            <Text bold={true} alignCenter={true} style={styles.errorText}>
              {I18n.t("wallet.errors.GENERIC_ERROR")}
            </Text>
            <View spacer={true} extralarge={true} />
            <View spacer={true} extralarge={true} />
            <Text alignCenter={true} style={styles.errorText2}>
              {I18n.t("wallet.errorTransaction.submitBugText")}
            </Text>
            <View spacer={true} extralarge={true} />
          </View>
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            block: true,
            primary: true,
            onPress: onRetry,
            title: I18n.t("global.buttons.retry")
          }}
        />
      </React.Fragment>
    );
  }

  // TODO: evaluate if it can be replaced by the component introduced within https://www.pivotaltracker.com/story/show/168247501
  private renderServiceLoadingPlaceholder() {
    return (
      <View style={[styles.center, styles.padded]}>
        {Platform.OS === "ios" && <View style={styles.customSpacer} />}
        <View spacer={true} extralarge={true} />
        <View spacer={true} extralarge={true} />
        <Image
          source={require("../../../img/services/icon-loading-services.png")}
        />
        <View spacer={true} extralarge={true} />
        <Text bold={true}>{I18n.t("services.loading.title")}</Text>
        <Text>{I18n.t("services.loading.subtitle")}</Text>
      </View>
    );
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    // saving current list scroll position to enable header animation
    // when shifting between tabs
    if (prevState.currentTab !== this.state.currentTab) {
      this.animatedScrollPositions.map((__, i) => {
        // when current tab changes, listeners are not kept, so it is needed to
        // assign them again.
        this.animatedScrollPositions[i].removeAllListeners();
        this.animatedScrollPositions[i].addListener(animatedValue => {
          // tslint:disable-next-line: no-object-mutation
          this.scollPositions[i] = animatedValue.value;
        });
      });
    }

    if (
      !this.state.isInnerContentRendered &&
      this.props.isFirstServiceLoadCompleted &&
      this.props.loadDataFailure === undefined
    ) {
      this.setState({ isInnerContentRendered: true });
    }

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
        (pot.isLoading(prevProps.visibleServicesContentLoadState) &&
          pot.isError(this.props.visibleServicesContentLoadState)) ||
        (pot.isLoading(prevProps.visibleServicesMetadataLoadState) &&
          pot.isError(this.props.visibleServicesMetadataLoadState))
      ) {
        // A toast is displayed if refresh visible services fails (on content or metadata load)
        showToast(this.state.toastErrorMessage, "danger");
      }
    }

    if (!prevState.enableHeaderAnimation && !this.props.isLoadingServices) {
      this.setState({ enableHeaderAnimation: true });
    }
  }

  private onServiceSelect = (service: ServicePublic) => {
    // when a service gets selected the service is recorded as read
    this.props.serviceDetailsLoad(service);
    this.props.navigateToServiceDetailsScreen({
      service
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

  private onItemSwitchValueChanged = (
    service: ServicePublic,
    value: boolean
  ) => {
    // check if the alert of disable service has not been shown already and if the service is active
    if (!this.props.wasServiceAlertDisplayedOnce && !value) {
      this.showAlertOnDisableServices(
        I18n.t("serviceDetail.disableTitle"),
        I18n.t("serviceDetail.disableMsg"),
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
        value
      );
    }
    this.updateLongPressButtonScope();
  };

  public componentWillUnmount() {
    if (this.navListener) {
      this.navListener.remove();
    }
  }

  /**
   * For tab Locals
   */
  private renderOrganizationLogo = (organizationFiscalCode: string) => {
    return (
      <OrganizationLogo
        logoUri={getLogoForOrganization(organizationFiscalCode)}
        imageStyle={styles.organizationLogo}
      />
    );
  };

  private organizationContainsText(item: Organization, searchText: string) {
    return isTextIncludedCaseInsensitive(item.name, searchText);
  }

  private showChooserAreasOfInterestModal = () => {
    const {
      selectableOrganizations,
      hideModal,
      selectedOrganizations
    } = this.props;
    this.props.showModal(
      <ChooserListContainer<Organization>
        items={selectableOrganizations}
        initialSelectedItemIds={some(new Set(selectedOrganizations || []))}
        keyExtractor={(item: Organization) => item.fiscalCode}
        itemTitleExtractor={(item: Organization) => item.name}
        itemIconComponent={left((fiscalCode: string) =>
          this.renderOrganizationLogo(fiscalCode)
        )}
        onCancel={hideModal}
        onSave={this.onSaveAreasOfInterest}
        isRefreshEnabled={false}
        matchingTextPredicate={this.organizationContainsText}
        noSearchResultsSourceIcon={require("../../../img/services/icon-no-places.png")}
        noSearchResultsSubtitle={I18n.t("services.areasOfInterest.searchEmpty")}
      />
    );
  };

  private onSaveAreasOfInterest = (
    selectedFiscalCodes: Option<Set<string>>
  ) => {
    this.setState({
      toastErrorMessage: I18n.t("serviceDetail.onUpdateEnabledChannelsFailure")
    });
    this.props.dispatchUpdateOrganizationsOfInterestMetadata(
      selectedFiscalCodes
    );
    this.props.hideModal();
  };

  // This method enable or disable services and update the enableServices props
  private disableOrEnableTabServices = () => {
    this.props.disableOrEnableServices(
      this.state.currentTabServicesId,
      this.props.profile,
      this.state.enableServices
    );
    this.updateLongPressButtonScope();
  };

  private renderLongPressFooterButtons = () => {
    return (
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
                () => this.disableOrEnableTabServices()
              );
            } else {
              this.disableOrEnableTabServices();
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
    );
  };

  private onNavigation = () => {
    this.setState({ isLongPressEnabled: false });
    // If cache has been cleaned and the page is already rendered,
    // it grants content is refreshed
    if (
      pot.isNone(this.props.visibleServices) &&
      !pot.isLoading(this.props.visibleServices)
    ) {
      this.refreshScreenContent();
    }
  };

  private renderErrorContent = () => {
    if (this.state.isInnerContentRendered) {
      return undefined;
    }

    switch (this.props.loadDataFailure) {
      case "userMetadaLoadFailure":
        return this.renderErrorPlaceholder(() =>
          this.refreshScreenContent(true)
        );
      case "servicesLoadFailure":
        return this.renderErrorPlaceholder(this.props.refreshServices);
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

  public render() {
    const contextualHelp = {
      title: I18n.t("services.title"),
      body: () => <Markdown>{I18n.t("services.servicesHelp")}</Markdown>
    };

    const { userMetadata } = this.props;
    return (
      <TopScreenComponent
        title={I18n.t("services.title")}
        appLogo={true}
        contextualHelp={contextualHelp}
        isSearchAvailable={userMetadata !== undefined}
        searchType={"Services"}
      >
        <NavigationEvents onWillFocus={this.onNavigation} />
        {this.renderErrorContent() ? (
          this.renderErrorContent()
        ) : this.props.isSearchEnabled ? (
          this.renderSearch()
        ) : (
          <React.Fragment>
            <ScreenContentHeader
              title={I18n.t("services.title")}
              icon={require("../../../img/icons/services-icon.png")}
              fixed={Platform.OS === "ios"}
            />
            {this.renderInnerContent()}
            {this.state.isLongPressEnabled &&
              this.renderLongPressFooterButtons()}
          </React.Fragment>
        )}
      </TopScreenComponent>
    );
  }

  private renderLocalQuickSectionDeletion = (section: ServicesSectionState) => {
    const onPressItem = () => {
      if (this.props.userMetadata && this.props.selectedOrganizations) {
        const updatedAreasOfInterest = this.props.selectedOrganizations.filter(
          item => item !== section.organizationFiscalCode
        );
        this.setState({
          toastErrorMessage: I18n.t(
            "serviceDetail.onUpdateEnabledChannelsFailure"
          )
        });
        this.props.saveSelectedOrganizationItems(
          this.props.userMetadata,
          updatedAreasOfInterest
        );
      }
    };
    return (
      <TouchableOpacity onPress={onPressItem}>
        <IconFont
          name={"io-trash"}
          color={"#C7D1D9"}
          size={17}
          style={styles.icon}
        />
      </TouchableOpacity>
    );
  };

  /**
   * Render ServicesSearch component.
   */
  private renderSearch = () => {
    return this.props.searchText
      .map(
        _ =>
          _.length < MIN_CHARACTER_SEARCH_TEXT ? (
            <SearchNoResultMessage errorType="InvalidSearchBarText" />
          ) : (
            <ServicesSearch
              sectionsState={this.props.allSections}
              profile={this.props.profile}
              onRefresh={() => {
                this.setState({
                  toastErrorMessage: I18n.t("global.genericError")
                });
                this.props.refreshServices();
              }}
              navigateToServiceDetail={this.onServiceSelect}
              searchText={_}
              readServices={this.props.readServices}
            />
          )
      )
      .getOrElse(<SearchNoResultMessage errorType="InvalidSearchBarText" />);
  };

  private refreshScreenContent = (hideToast: boolean = false) => {
    if (!hideToast) {
      this.setState({ toastErrorMessage: I18n.t("global.genericError") });
    }
    this.props.refreshUserMetadata();
    this.props.refreshServices();
  };

  /**
   * Render Locals, Nationals and Other services tabs.
   */
  // tslint:disable no-big-function
  private renderTabs = () => {
    const {
      localTabSections,
      nationalTabSections,
      allTabSections,
      profile,
      potUserMetadata,
      isLoadingServices,
      readServices,
      selectedOrganizations
    } = this.props;
    return (
      <AnimatedTabs
        tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
        tabBarUnderlineStyle={styles.tabBarUnderlineActive}
        onScroll={(value: number) => {
          const { currentTab, isLongPressEnabled } = this.state;
          if (isLongPressEnabled && Math.abs(value - currentTab) > 0.5) {
            this.setState({
              isLongPressEnabled: false
            });
          }
        }}
        onChangeTab={(evt: any) => {
          const { currentTab, isLongPressEnabled } = this.state;
          const nextTab: number = evt.i;
          const isSameTab = currentTab === nextTab;
          this.setState({
            currentTab: nextTab,
            isLongPressEnabled: isSameTab && isLongPressEnabled
          });
        }}
        initialPage={0}
        style={
          Platform.OS === "ios" && {
            transform: [
              {
                // enableHeaderAnimation is used to avoid unwanted refresh of
                // animation
                translateY: this.state.enableHeaderAnimation
                  ? this.animatedScrollPositions[
                      this.state.currentTab
                    ].interpolate({
                      inputRange: [
                        0,
                        SCROLL_RANGE_FOR_ANIMATION / 2,
                        SCROLL_RANGE_FOR_ANIMATION
                      ],
                      outputRange: [
                        SCROLL_RANGE_FOR_ANIMATION,
                        SCROLL_RANGE_FOR_ANIMATION / 4,
                        0
                      ],
                      extrapolate: "clamp"
                    })
                  : SCROLL_RANGE_FOR_ANIMATION
              }
            ]
          }
        }
      >
        <Tab
          activeTextStyle={styles.activeTextStyle}
          textStyle={styles.textStyle}
          heading={I18n.t("services.tab.locals")}
        >
          <ServicesSectionsList
            isLocal={true}
            sections={localTabSections}
            profile={profile}
            isRefreshing={
              isLoadingServices ||
              pot.isLoading(potUserMetadata) ||
              pot.isUpdating(potUserMetadata)
            }
            onRefresh={this.refreshScreenContent}
            onSelect={this.onServiceSelect}
            readServices={readServices}
            onChooserAreasOfInterestPress={this.showChooserAreasOfInterestModal}
            selectedOrganizationsFiscalCodes={
              new Set(selectedOrganizations || [])
            }
            onLongPressItem={this.handleOnLongPressItem}
            isLongPressEnabled={this.state.isLongPressEnabled}
            onItemSwitchValueChanged={this.onItemSwitchValueChanged}
            animated={{
              onScroll: Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: this.animatedScrollPositions[0]
                      }
                    }
                  }
                ],
                { useNativeDriver: true }
              ),
              scrollEventThrottle: 8 // target is 120fps
            }}
            renderRightIcon={this.renderLocalQuickSectionDeletion}
          />
        </Tab>
        <Tab
          activeTextStyle={styles.activeTextStyle}
          textStyle={styles.textStyle}
          heading={I18n.t("services.tab.national")}
        >
          <ServicesSectionsList
            sections={nationalTabSections}
            profile={profile}
            isRefreshing={isLoadingServices || pot.isLoading(potUserMetadata)}
            onRefresh={this.refreshScreenContent}
            onSelect={this.onServiceSelect}
            readServices={readServices}
            onLongPressItem={this.handleOnLongPressItem}
            isLongPressEnabled={this.state.isLongPressEnabled}
            onItemSwitchValueChanged={this.onItemSwitchValueChanged}
            animated={{
              onScroll: Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: this.animatedScrollPositions[1]
                      }
                    }
                  }
                ],
                { useNativeDriver: true }
              ),
              scrollEventThrottle: 8 // target is 120fps
            }}
          />
        </Tab>
        <Tab
          activeTextStyle={styles.activeTextStyle}
          textStyle={styles.textStyle}
          heading={I18n.t("services.tab.all")}
        >
          <ServicesSectionsList
            sections={allTabSections}
            profile={profile}
            isRefreshing={isLoadingServices || pot.isLoading(potUserMetadata)}
            onRefresh={this.refreshScreenContent}
            onSelect={this.onServiceSelect}
            readServices={readServices}
            onLongPressItem={this.handleOnLongPressItem}
            isLongPressEnabled={this.state.isLongPressEnabled}
            onItemSwitchValueChanged={this.onItemSwitchValueChanged}
            animated={{
              onScroll: Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: this.animatedScrollPositions[2]
                      }
                    }
                  }
                ],
                { useNativeDriver: true }
              ),
              scrollEventThrottle: 8 // target is 120fps
            }}
          />
        </Tab>
      </AnimatedTabs>
    );
  };
}

const mapStateToProps = (state: GlobalState) => {
  const potUserMetadata = userMetadataSelector(state);
  const userMetadata = pot.getOrElse(potUserMetadata, undefined);

  const localServicesSections = localServicesSectionsSelector(state);
  const selectableOrganizations = localServicesSections.map(
    (section: ServicesSectionState) => {
      return {
        name: section.organizationName,
        fiscalCode: section.organizationFiscalCode
      };
    }
  );

  const localTabSections = selectedLocalServicesSectionsSelector(state);
  const nationalTabSections = nationalServicesSectionsSelector(state);
  const allTabSections = notSelectedServicesSectionsSelector(state);

  // All visibile services organized in sections
  const allSections: ReadonlyArray<ServicesSectionState> = [
    ...localTabSections,
    ...allTabSections
  ];

  const getTabSevicesId = (
    tabServices: ReadonlyArray<ServicesSectionState>
  ) => {
    return tabServices.reduce(
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
  };

  const tabsServicesId: { [k: number]: ReadonlyArray<string> } = {
    [0]: getTabSevicesId(localTabSections),
    [1]: getTabSevicesId(nationalTabSections),
    [2]: getTabSevicesId(allTabSections)
  };

  const visibleServicesContentLoadState = visibleServicesContentLoadStateSelector(
    state
  );
  const visibleServicesMetadataLoadState = visibleServicesMetadataLoadStateSelector(
    state
  );

  const isFirstServiceLoadCompleted =
    pot.isSome(visibleServicesContentLoadState) &&
    pot.isSome(visibleServicesMetadataLoadState);

  const isLoadingServices =
    pot.isLoading(visibleServicesContentLoadState) ||
    pot.isLoading(visibleServicesMetadataLoadState);

  const servicesLoadingFailure =
    !pot.isLoading(potUserMetadata) &&
    (pot.isError(visibleServicesContentLoadState) ||
      pot.isError(visibleServicesMetadataLoadState));

  const loadDataFailure: DataLoadFailure = pot.isError(potUserMetadata)
    ? "userMetadaLoadFailure"
    : servicesLoadingFailure
      ? "servicesLoadFailure"
      : undefined;

  return {
    selectableOrganizations,
    selectedOrganizations: organizationsOfInterestSelector(state),
    isLoadingServices,
    isFirstServiceLoadCompleted,
    visibleServicesContentLoadState,
    visibleServicesMetadataLoadState,
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
  refreshUserMetadata: () => dispatch(userMetadataLoad.request()),
  refreshServices: () => dispatch(loadVisibleServices.request()),
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
  updatePersistedPreference: (value: boolean) => {
    dispatch(
      serviceAlertDisplayedOnceSuccess({
        wasServiceAlertDisplayedOnce: value
      })
    );
  },
  navigateToServiceDetailsScreen: (
    params: InferNavigationParams<typeof ServiceDetailsScreen>
  ) => dispatch(navigateToServiceDetailsScreen(params)),
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
  const dispatchUpdateOrganizationsOfInterestMetadata = (
    selectedItemIds: Option<Set<string>>
  ) => {
    if (selectedItemIds.isSome() && stateProps.userMetadata) {
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
      dispatchUpdateOrganizationsOfInterestMetadata
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withLightModalContext(ServicesHomeScreen));
