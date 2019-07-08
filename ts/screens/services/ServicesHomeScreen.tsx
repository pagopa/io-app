import { Tab, TabHeading, Tabs, Text } from "native-base";
import * as React from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { NavigationScreenProps } from "react-navigation";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import ServicesLocal from "../../components/services/ServicesLocal";
import ServicesNational from "../../components/services/ServicesNational";
import ServicesOther from "../../components/services/ServicesOther";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

type Props = NavigationScreenProps;

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

export default ServicesHomeScreen;
