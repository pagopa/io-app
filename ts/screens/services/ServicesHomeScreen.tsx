import { left } from "fp-ts/lib/Either";
import { Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Tab, TabHeading, Tabs, Text } from "native-base";
import * as React from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import ChooserListContainer from "../../components/ChooserListContainer";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import OrganizationLogo from "../../components/services/OrganizationLogo";
import ServicesLocal from "../../components/services/ServicesLocal";
import ServicesNational from "../../components/services/ServicesNational";
import ServicesOther from "../../components/services/ServicesOther";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { contentServiceLoad } from "../../store/actions/content";
import { navigateToOldServiceDetailsScreen } from "../../store/actions/navigation";
import { setSelectedOrganizations } from "../../store/actions/organizations";
import {
  loadVisibleServices,
  showServiceDetails
} from "../../store/actions/services";
import { Dispatch } from "../../store/actions/types";
import { lexicallyOrderedAllOrganizations } from "../../store/reducers/entities/organizations";
import { Organization } from "../../store/reducers/entities/organizations/organizationsAll";
import { organizationsFiscalCodesSelectedStateSelector } from "../../store/reducers/entities/organizations/organizationsFiscalCodesSelected";
import { localServicesSectionsSelector } from "../../store/reducers/entities/services";
import { readServicesSelector } from "../../store/reducers/entities/services/readStateByServiceId";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { InferNavigationParams } from "../../types/react";
import { getLogoForOrganization } from "../../utils/organizations";
import { isTextIncludedCaseInsensitive } from "../../utils/strings";
import OldServiceDetailsScreen from "../preferences/OldServiceDetailsScreen";

type OwnProps = NavigationScreenProps;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps &
  LightModalContextInterface;

type State = {
  currentTab: number;
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
  }
});

const AnimatedTabs = Animated.createAnimatedComponent(Tabs);
/**
 * A screen that contains all the Tabs related to services.
 */
class ServicesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0
    };
  }

  public componentDidMount() {
    // on mount, update visible services
    this.props.refreshServices();
  }

  private animatedScrollPositions: ReadonlyArray<Animated.Value> = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  // tslint:disable-next-line: readonly-array
  private scollPositions: number[] = [0, 0, 0];

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
      allOrganizations,
      hideModal,
      organizationsSelected,
      isLoading
    } = this.props;
    this.props.showModal(
      <ChooserListContainer<Organization>
        items={allOrganizations}
        initialSelectedItemIds={some(new Set(organizationsSelected))}
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
    const { saveSelectedOrganizationItems, hideModal } = this.props;
    saveSelectedOrganizationItems(selectedFiscalCodes);
    hideModal();
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
        <React.Fragment>
          <ScreenContentHeader
            title={I18n.t("services.title")}
            icon={require("../../../img/icons/services-icon.png")}
            fixed={true}
          />
          {this.renderTabs()}
        </React.Fragment>
      </TopScreenComponent>
    );
  }

  /**
   * Render Locals, Nationals and Other services tabs.
   */
  private renderTabs = () => {
    return (
      <AnimatedTabs
        tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
        tabBarUnderlineStyle={styles.tabBarUnderlineActive}
        onChangeTab={(evt: any) => {
          this.setState({ currentTab: evt.i });
        }}
        initialPage={0}
        style={{
          transform: [
            {
              translateY: this.animatedScrollPositions[
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
            }
          ]
        }}
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
          <ServicesLocal
            sections={this.props.localSections}
            profile={this.props.profile}
            isRefreshing={this.props.isLoading}
            onRefresh={this.props.refreshServices}
            onSelect={this.onServiceSelect}
            readServices={this.props.readServices}
            onChooserAreasOfInterestPress={this.showChooserAreasOfInterestModal}
            organizationsFiscalCodesSelected={some(
              new Set(this.props.organizationsSelected)
            )}
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
            paddingForAnimation={true}
            AnimatedCTAStyle={{
              transform: [
                {
                  translateY: this.animatedScrollPositions[
                    this.state.currentTab
                  ].interpolate({
                    inputRange: [
                      0,
                      SCROLL_RANGE_FOR_ANIMATION / 2,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    outputRange: [
                      0,
                      SCROLL_RANGE_FOR_ANIMATION * 0.75,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    extrapolate: "clamp"
                  })
                }
              ]
            }}
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
          <ServicesNational
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
            paddingForAnimation={true}
            AnimatedCTAStyle={{
              transform: [
                {
                  translateY: this.animatedScrollPositions[
                    this.state.currentTab
                  ].interpolate({
                    inputRange: [
                      0,
                      SCROLL_RANGE_FOR_ANIMATION / 2,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    outputRange: [
                      0,
                      SCROLL_RANGE_FOR_ANIMATION * 0.75,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    extrapolate: "clamp"
                  })
                }
              ]
            }}
          />
        </Tab>
        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("services.tab.otherServices")}
              </Text>
            </TabHeading>
          }
        >
          <ServicesOther
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
            paddingForAnimation={true}
            AnimatedCTAStyle={{
              transform: [
                {
                  translateY: this.animatedScrollPositions[
                    this.state.currentTab
                  ].interpolate({
                    inputRange: [
                      0,
                      SCROLL_RANGE_FOR_ANIMATION / 2,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    outputRange: [
                      0,
                      SCROLL_RANGE_FOR_ANIMATION * 0.75,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    extrapolate: "clamp"
                  })
                }
              ]
            }}
          />
        </Tab>
      </AnimatedTabs>
    );
  };
}

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
    allOrganizations: lexicallyOrderedAllOrganizations(state),
    isLoading,
    organizationsSelected: organizationsFiscalCodesSelectedStateSelector(state),
    profile: state.profile,
    readServices: readServicesSelector(state),
    localSections: localServicesSectionsSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshServices: () => dispatch(loadVisibleServices.request()),
  saveSelectedOrganizationItems: (selectedItemIds: Option<Set<string>>) => {
    if (selectedItemIds.isSome()) {
      dispatch(setSelectedOrganizations(Array.from(selectedItemIds.value)));
    }
  },
  contentServiceLoad: (serviceId: ServiceId) =>
    dispatch(contentServiceLoad.request(serviceId)),
  navigateToOldServiceDetailsScreen: (
    params: InferNavigationParams<typeof OldServiceDetailsScreen>
  ) => dispatch(navigateToOldServiceDetailsScreen(params)),
  serviceDetailsLoad: (service: ServicePublic) =>
    dispatch(showServiceDetails(service))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ServicesHomeScreen));
