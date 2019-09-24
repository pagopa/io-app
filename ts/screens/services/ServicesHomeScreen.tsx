/**
 * A screen that contains all the available servives.
 * - Local tab: services sections related to the areas of interest selected by the user
 * - National tab: national services sections
 * - All: local and national services sections, not including the user areas of interest
 */
import { left } from "fp-ts/lib/Either";
import { Option, some, Some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import {
  Button,
  Content,
  Tab,
  TabHeading,
  Tabs,
  Text,
  View
} from "native-base";
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
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import ChooserListContainer from "../../components/ChooserListContainer";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import OrganizationLogo from "../../components/services/OrganizationLogo";
import ServicesSectionsList from "../../components/services/ServicesSectionsList";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import IconFont from "../../components/ui/IconFont";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { contentServiceLoad } from "../../store/actions/content";
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
  isLoadingServicesSelector,
  localServicesSectionsSelector,
  nationalServicesSectionsSelector,
  notSelectedServicesSectionsSelector,
  selectedLocalServicesSectionsSelector,
  ServicesSectionState
} from "../../store/reducers/entities/services";
import { isFirstVisibleServiceLoadCompletedSelector } from "../../store/reducers/entities/services/firstServicesLoading";
import { readServicesByIdSelector } from "../../store/reducers/entities/services/readStateByServiceId";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { wasServiceAlertDisplayedOnceSelector } from "../../store/reducers/persistedPreferences";
import { profileSelector, ProfileState } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import {
  organizationsOfInterestSelector,
  UserMetadata,
  userMetadataSelector
} from "../../store/reducers/userMetadata";
import customVariables from "../../theme/variables";
import { InferNavigationParams } from "../../types/react";
import { getLogoForOrganization } from "../../utils/organizations";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";
import { isTextIncludedCaseInsensitive } from "../../utils/strings";
import {
  getChannelsforServicesList,
  getProfileChannelsforServicesList
} from "../preferences/common";
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
};

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
      enableServices: false
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
    this.updateLongPressButtonScope();
    const isLongPressEnabled = !this.state.isLongPressEnabled;
    const currentTabServicesId = this.props.tabsServicesId[
      this.state.currentTab
    ];
    this.setState({
      isLongPressEnabled,
      currentTabServicesId
    });
  };

  public componentDidMount() {
    // on mount, update visible services
    this.props.refreshServices();
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

  private renderErrorContent() {
    return (
      <React.Fragment>
        <Content>
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
            onPress: this.props.retryUserMetadataLoad,
            title: I18n.t("global.buttons.retry")
          }}
        />
      </React.Fragment>
    );
  }

  private renderFirstServiceLoadingContent() {
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

  public componentDidUpdate(_: Props, prevState: State) {
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
    if (!prevState.enableHeaderAnimation && !this.props.isLoading) {
      this.setState({ enableHeaderAnimation: true });
    }
  }

  private onServiceSelect = (service: ServicePublic) => {
    // when a service gets selected, before navigating to the service detail
    // screen, we issue a contentServiceLoad to refresh the service metadata

    // TODO: evaluate if it makes sense to load the service metadata also on click  (now they are previously loaded)
    this.props.contentServiceLoad(service.service_id);
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
      selectedOrganizations,
      isLoading
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
        isRefreshing={isLoading}
        matchingTextPredicate={this.organizationContainsText}
        noSearchResultsSourceIcon={require("../../../img/services/icon-no-places.png")}
        noSearchResultsSubtitle={I18n.t("services.areasOfInterest.searchEmpty")}
      />
    );
  };

  private onSaveAreasOfInterest = (
    selectedFiscalCodes: Option<Set<string>>
  ) => {
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

  public render() {
    return (
      <TopScreenComponent
        title={I18n.t("services.title")}
        appLogo={true}
        contextualHelp={{
          title: I18n.t("services.title"),
          body: () => <Markdown>{I18n.t("services.servicesHelp")}</Markdown>
        }}
      >
        <NavigationEvents
          onWillFocus={() => this.setState({ isLongPressEnabled: false })}
        />
        {this.props.userMetadata ? (
          <React.Fragment>
            <ScreenContentHeader
              title={I18n.t("services.title")}
              icon={require("../../../img/icons/services-icon.png")}
              fixed={Platform.OS === "ios"}
            />
            {this.props.isFirstServiceLoadCompleted
              ? this.renderTabs()
              : this.renderFirstServiceLoadingContent()}
            {this.state.isLongPressEnabled &&
              this.renderLongPressFooterButtons()}
          </React.Fragment>
        ) : (
          this.renderErrorContent()
        )}
      </TopScreenComponent>
    );
  }

  private renderLocalQuickSectionDeletion = (section: ServicesSectionState) => {
    const onPressItem = () => {
      if (this.props.userMetadata && this.props.selectedOrganizations) {
        this.props.removeSelectedOrgnizationItem(
          this.props.userMetadata,
          this.props.selectedOrganizations,
          section.organizationFiscalCode
        );
      }
    };
    return (
      <TouchableOpacity onPress={onPressItem}>
        <IconFont name={"io-trash"} color={"#C7D1D9"} size={17} />
      </TouchableOpacity>
    );
  };

  /**
   * Render Locals, Nationals and Other services tabs.
   */
  // tslint:disable no-big-function
  private renderTabs = () => {
    return (
      <AnimatedTabs
        tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
        tabBarUnderlineStyle={styles.tabBarUnderlineActive}
        onChangeTab={(evt: any) => {
          this.setState({ currentTab: evt.i, isLongPressEnabled: false });
        }}
        initialPage={0}
        style={
          Platform.OS === "ios" && {
            transform: [
              {
                // hasRefreshedOnceUp is used to avoid unwanted refresh of
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
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("services.tab.locals")}
              </Text>
            </TabHeading>
          }
        >
          <ServicesSectionsList
            isLocal={true}
            sections={this.props.localTabSections}
            profile={this.props.profile}
            isRefreshing={this.props.isLoading}
            onRefresh={this.props.refreshServices}
            onSelect={this.onServiceSelect}
            readServices={this.props.readServices}
            onChooserAreasOfInterestPress={this.showChooserAreasOfInterestModal}
            selectedOrganizationsFiscalCodes={
              new Set(this.props.selectedOrganizations || [])
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
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("services.tab.national")}
              </Text>
            </TabHeading>
          }
        >
          <ServicesSectionsList
            sections={this.props.nationalTabSections}
            profile={this.props.profile}
            isRefreshing={this.props.isLoading}
            onRefresh={this.props.refreshServices}
            onSelect={this.onServiceSelect}
            readServices={this.props.readServices}
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
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("services.tab.all")}
              </Text>
            </TabHeading>
          }
        >
          <ServicesSectionsList
            sections={this.props.allTabSections}
            profile={this.props.profile}
            isRefreshing={this.props.isLoading}
            onRefresh={this.props.refreshServices}
            onSelect={this.onServiceSelect}
            readServices={this.props.readServices}
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
  // TODO: disable selection of areas of interest if the user metadata are not loaded
  // (it causes the new selection is not loaded) https://www.pivotaltracker.com/story/show/168312476
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

  return {
    selectableOrganizations,
    selectedOrganizations: organizationsOfInterestSelector(state),
    isLoading: isLoadingServicesSelector(state),
    isFirstServiceLoadCompleted: isFirstVisibleServiceLoadCompletedSelector(
      state
    ),
    profile: profileSelector(state),
    readServices: readServicesByIdSelector(state),
    localTabSections,
    nationalTabSections,
    allTabSections,
    tabsServicesId,
    wasServiceAlertDisplayedOnce: wasServiceAlertDisplayedOnceSelector(state),
    servicesById: servicesByIdSelector(state),
    userMetadata
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  retryUserMetadataLoad: () => {
    dispatch(userMetadataLoad.request());
  },
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
    selectedItemIds: Some<Set<string>>
  ) => {
    const metadata = userMetadata.metadata;
    dispatch(
      userMetadataUpsert.request({
        ...userMetadata,
        // tslint:disable-next-line: no-useless-cast
        version: (userMetadata.version as number) + 1,
        metadata: {
          ...metadata,
          organizationsOfInterest: Array.from(selectedItemIds.value)
        }
      })
    );
  },
  removeSelectedOrgnizationItem: (
    userMetadata: UserMetadata,
    selectedOrganizations: ReadonlyArray<string>,
    selectedOrganizationId: string
  ) => {
    const metadata = userMetadata.metadata;
    const updatedAreasOfInterest = selectedOrganizations.filter(
      item => item !== selectedOrganizationId
    );
    dispatch(
      userMetadataUpsert.request({
        ...userMetadata,
        // tslint:disable-next-line: no-useless-cast
        version: (userMetadata.version as number) + 1,
        metadata: {
          ...metadata,
          organizationsOfInterest: updatedAreasOfInterest
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
  contentServiceLoad: (serviceId: ServiceId) =>
    dispatch(contentServiceLoad.request(serviceId)),
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
      dispatchProps.saveSelectedOrganizationItems(
        stateProps.userMetadata,
        selectedItemIds
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
