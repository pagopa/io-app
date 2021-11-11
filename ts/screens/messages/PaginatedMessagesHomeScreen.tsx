/**
 * A screen that contains all the Tabs related to messages.
 */
import * as React from "react";
import { Animated } from "react-native";
import { NavigationEventSubscription } from "react-navigation";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { Millisecond } from "italia-ts-commons/lib/units";

import MessagesSearch from "../../components/messages/paginated/MessagesSearch";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import SectionStatusComponent from "../../components/SectionStatus";
import I18n from "../../i18n";
import { loadNextPageMessages } from "../../store/actions/messages";
import { Dispatch } from "../../store/actions/types";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { HEADER_HEIGHT, MESSAGE_ICON_HEIGHT } from "../../utils/constants";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";
import { sectionStatusSelector } from "../../store/reducers/backendStatus";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { allMessagesSelector } from "../../store/reducers/entities/messages/allPaginated";
import { pageSize } from "../../config";
import HomeTabs from "../../components/messages/HomeTabs";
import MessageList from "../../components/messages/paginated/MessageList";

type Props = NavigationStackScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  currentTab: number;
};

const AnimatedScreenContentHeader =
  Animated.createAnimatedComponent(ScreenContentHeader);

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "messages.contextualHelpTitle",
  body: "messages.contextualHelpContent"
};

/**
 * A screen that contains all the Tabs related to messages.
 */
class MessagesHomeScreen extends React.PureComponent<Props, State> {
  navListener?: NavigationEventSubscription;

  animatedTabScrollPositions: ReadonlyArray<Animated.Value> = [
    new Animated.Value(0)
  ];

  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0
    };
  }

  componentDidMount() {
    this.props.loadFirstPage();
    // eslint-disable-next-line functional/immutable-data
    this.navListener = this.props.navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "dark-content",
        customVariables.colorWhite
      );
    });
  }

  componentWillUnmount() {
    if (this.navListener) {
      this.navListener.remove();
    }
  }

  // It create a mostly 2 states output: it value is mostly 0 or HEADER_HEIGHT
  getHeaderHeight = (): Animated.AnimatedInterpolation =>
    this.animatedTabScrollPositions[this.state.currentTab].interpolate({
      inputRange: [0, HEADER_HEIGHT],
      outputRange: [0, 1],
      extrapolate: "clamp"
    });

  render() {
    const { isSearchEnabled, allMessages } = this.props;

    return (
      <TopScreenComponent
        accessibilityEvents={{
          disableAccessibilityFocus:
            this.props.messageSectionStatusActive !== undefined
        }}
        accessibilityLabel={I18n.t("messages.contentTitle")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["messages"]}
        headerTitle={I18n.t("messages.contentTitle")}
        isSearchAvailable={{ enabled: true, searchType: "Messages" }}
        appLogo={true}
      >
        <SectionStatusComponent
          sectionKey={"messages"}
          onSectionRef={v => {
            setAccessibilityFocus(v, 100 as Millisecond);
          }}
        />
        {!isSearchEnabled && (
          <React.Fragment>
            <AnimatedScreenContentHeader
              title={I18n.t("messages.contentTitle")}
              iconFont={{ name: "io-home-messaggi", size: MESSAGE_ICON_HEIGHT }}
              dynamicHeight={this.getHeaderHeight()}
            />
            <HomeTabs
              animatedTabScrollPositions={this.animatedTabScrollPositions}
              onTabChange={(index: number) =>
                this.setState({ currentTab: index })
              }
            />
          </React.Fragment>
        )}

        {isSearchEnabled &&
          this.props.searchText
            .map(_ =>
              _.length < MIN_CHARACTER_SEARCH_TEXT ? (
                <SearchNoResultMessage errorType="InvalidSearchBarText" />
              ) : (
                <MessagesSearch
                  messages={allMessages}
                  searchText={_}
                  renderSearchResults={results => (
                    <MessageList filteredMessages={results} />
                  )}
                />
              )
            )
            .getOrElse(
              <SearchNoResultMessage errorType="InvalidSearchBarText" />
            )}
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  allMessages: allMessagesSelector(state),
  isSearchEnabled: isSearchMessagesEnabledSelector(state),
  messageSectionStatusActive: sectionStatusSelector("messages")(state),
  searchText: searchTextSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // used for the first rendering only
  loadFirstPage: () => {
    dispatch(loadNextPageMessages.request({ pageSize }));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MessagesHomeScreen);
