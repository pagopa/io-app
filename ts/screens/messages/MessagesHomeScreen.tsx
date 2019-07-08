import * as pot from "italia-ts-commons/lib/pot";
import { Tab, TabHeading, Tabs, Text } from "native-base";
import * as React from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";

import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import MessagesArchive from "../../components/messages/MessagesArchive";
import MessagesDeadlines from "../../components/messages/MessagesDeadlines";
import MessagesInbox from "../../components/messages/MessagesInbox";
import MessagesSearch from "../../components/messages/MessagesSearch";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import I18n from "../../i18n";
import {
  loadMessages,
  setMessagesArchivedState
} from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  currentTab: number;
  hasRefreshedOnceUp: boolean;
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
 * A screen that contains all the Tabs related to messages.
 */
class MessagesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0,
      hasRefreshedOnceUp: false
    };
  }

  private animatedScrollPositions: ReadonlyArray<Animated.Value> = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  // tslint:disable-next-line: readonly-array
  private scollPositions: number[] = [0, 0, 0];

  public componentDidMount() {
    this.props.refreshMessages();
  }

  public componentDidUpdate(prevprops: Props, prevstate: State) {
    // saving current list scroll position to enable header animation
    // when shifting between tabs
    if (prevstate.currentTab !== this.state.currentTab) {
      this.animatedScrollPositions.map((_, i) => {
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
      pot.isLoading(prevprops.lexicallyOrderedMessagesState) &&
      !pot.isLoading(this.props.lexicallyOrderedMessagesState) &&
      !prevstate.hasRefreshedOnceUp
    ) {
      this.setState({ hasRefreshedOnceUp: true });
    }
  }

  public render() {
    const { isSearchEnabled } = this.props;
    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        isSearchAvailable={true}
        searchType="Messages"
        appLogo={true}
      >
        {!isSearchEnabled && (
          <React.Fragment>
            <ScreenContentHeader
              title={I18n.t("messages.contentTitle")}
              icon={require("../../../img/icons/message-icon.png")}
              fixed={Platform.OS === "ios"}
            />
            {this.renderTabs()}
          </React.Fragment>
        )}
        {isSearchEnabled && this.renderSearch()}
      </TopScreenComponent>
    );
  }

  /**
   * Render Inbox, Deadlines and Archive tabs.
   */
  private renderTabs = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail,
      updateMessagesArchivedState
    } = this.props;

    return (
      <AnimatedTabs
        tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
        tabBarUnderlineStyle={styles.tabBarUnderlineActive}
        onChangeTab={(evt: any) => {
          this.setState({ currentTab: evt.i });
        }}
        initialPage={0}
        style={
          Platform.OS === "ios" && {
            transform: [
              {
                // hasRefreshedOnceUp is used to avoid unwanted refresh of
                // animation after a new set of messages is received from
                // backend at first load
                translateY: this.state.hasRefreshedOnceUp
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
                {I18n.t("messages.tab.inbox")}
              </Text>
            </TabHeading>
          }
        >
          <MessagesInbox
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            onRefresh={refreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
            animated={
              Platform.OS === "ios"
                ? {
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
                      {
                        useNativeDriver: true
                      }
                    ),
                    scrollEventThrottle: 8 // target is 120fps
                  }
                : undefined
            }
            paddingForAnimation={Platform.OS === "ios"}
            AnimatedCTAStyle={
              Platform.OS === "ios"
                ? {
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
                  }
                : undefined
            }
          />
        </Tab>
        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("messages.tab.deadlines")}
              </Text>
            </TabHeading>
          }
        >
          <MessagesDeadlines
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
          />
        </Tab>

        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("messages.tab.archive")}
              </Text>
            </TabHeading>
          }
        >
          <MessagesArchive
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            onRefresh={refreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
            animated={
              Platform.OS === "ios"
                ? {
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
                  }
                : undefined
            }
            paddingForAnimation={Platform.OS === "ios"}
            AnimatedCTAStyle={
              Platform.OS === "ios"
                ? {
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
                  }
                : undefined
            }
          />
        </Tab>
      </AnimatedTabs>
    );
  };

  /**
   * Render MessageSearch component.
   */
  private renderSearch = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail
    } = this.props;

    return this.props.searchText
      .map(
        _ =>
          _.length < MIN_CHARACTER_SEARCH_TEXT ? (
            <SearchNoResultMessage errorType="InvalidSearchBarText" />
          ) : (
            <MessagesSearch
              messagesState={lexicallyOrderedMessagesState}
              servicesById={servicesById}
              paymentsByRptId={paymentsByRptId}
              onRefresh={refreshMessages}
              navigateToMessageDetail={navigateToMessageDetail}
              searchText={_}
            />
          )
      )
      .getOrElse(<SearchNoResultMessage errorType="InvalidSearchBarText" />);
  };
}

const mapStateToProps = (state: GlobalState) => ({
  lexicallyOrderedMessagesState: lexicallyOrderedMessagesStateSelector(state),
  servicesById: servicesByIdSelector(state),
  paymentsByRptId: paymentsByRptIdSelector(state),
  searchText: searchTextSelector(state),
  isSearchEnabled: isSearchMessagesEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshMessages: () => {
    dispatch(loadMessages.request());
  },
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageDetailScreenAction({ messageId })),
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => dispatch(setMessagesArchivedState(ids, archived))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessagesHomeScreen);
