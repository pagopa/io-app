import { left } from "fp-ts/lib/Either";
import { Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Tab, TabHeading, Tabs, Text } from "native-base";
import * as React from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import ChooserListContainer from "../../components/ChooserListContainer";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import OrganizationLogo from "../../components/services/OrganizationLogo";
import ServicesLocal from "../../components/services/ServicesLocal";
import ServicesNational from "../../components/services/ServicesNational";
import ServicesOther from "../../components/services/ServicesOther";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { loadVisibleServices } from "../../store/actions/services";
import { Dispatch } from "../../store/actions/types";
import { userMetadataUpsert } from "../../store/actions/userMetadata";
import { lexicallyOrderedAllOrganizations } from "../../store/reducers/entities/organizations";
import { Organization } from "../../store/reducers/entities/organizations/organizationsAll";
import { GlobalState } from "../../store/reducers/types";
import {
  UserMetadata,
  userMetadataSelector
} from "../../store/reducers/userMetadata";
import customVariables from "../../theme/variables";
import { getLogoForOrganization } from "../../utils/organizations";
import { isTextIncludedCaseInsensitive } from "../../utils/strings";

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
    const { allOrganizations, hideModal, organizationsSelected } = this.props;
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
        matchingTextPredicate={this.organizationContainsText}
        noSearchResultsSourceIcon={require("../../../img/services/icon-no-places.png")}
        noSearchResultsSubtitle={I18n.t("services.areasOfInterest.searchEmpty")}
      />
    );
  };

  private onSaveAreasOfInterest = (
    selectedFiscalCodes: Option<Set<string>>
  ) => {
    const { hideModal } = this.props;
    this.props.dispatchUpdateOrganizationsOfInterestMetadata(
      selectedFiscalCodes
    );
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

  const potUserMetadata = userMetadataSelector(state);
  const userMetadata = pot.getOrElse(potUserMetadata, undefined);
  const organizationsSelected = userMetadata
    ? userMetadata.metadata.organizationsOfInterest
    : undefined;

  const isAnyServiceLoading =
    Object.keys(services.byId).find(k => {
      const oneService = services.byId[k];
      return oneService !== undefined && pot.isLoading(oneService);
    }) !== undefined;

  const isLoading =
    pot.isLoading(state.entities.services.visible) ||
    isAnyServiceLoading ||
    pot.isLoading(potUserMetadata);

  return {
    allOrganizations: lexicallyOrderedAllOrganizations(state),
    isLoading,
    organizationsSelected,
    userMetadata
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshServices: () => dispatch(loadVisibleServices.request()),
  saveSelectedOrganizationItems: (
    userMetadata: UserMetadata,
    selectedItemIds: Option<Set<string>>
  ) => {
    if (selectedItemIds.isSome()) {
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
    }
  }
});

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>,
  ownProps: OwnProps
) => {
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
)(withLightModalContext(withLoadingSpinner(ServicesHomeScreen)));
