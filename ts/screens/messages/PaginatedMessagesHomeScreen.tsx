/**
 * A screen that contains all the Tabs related to messages.
 */
import * as React from "react";
import { Animated } from "react-native";
import { NavigationEventSubscription } from "react-navigation";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { Millisecond } from "italia-ts-commons/lib/units";
import * as pot from "italia-ts-commons/lib/pot";

import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import MessagesSearch from "../../components/messages/MessagesSearch";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import SectionStatusComponent from "../../components/SectionStatus";
import I18n from "../../i18n";
import {
  loadNextPageMessages,
  reloadAllMessages,
  setMessagesArchivedState
} from "../../store/actions/messages";
import { navigateToMessageRouterScreen } from "../../store/actions/navigation";
import { loadServiceDetail } from "../../store/actions/services";
import { Dispatch } from "../../store/actions/types";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
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
import {
  allPaginatedMessagesSelector,
  Cursor
} from "../../store/reducers/entities/messages/allPaginated";
import { pageSize } from "../../config";
import HomeTabs from "../../components/messages/HomeTabs";
import { UIMessage } from "../../store/reducers/entities/messages/types";
import { messagesStatusSelector } from "../../store/reducers/entities/messages/messagesStatus";

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

type UnwrappedMessageState = {
  error?: string;
  allMessages: ReadonlyArray<UIMessage>;
  isLoading: boolean;
  nextCursor?: Cursor;
  previousCursor?: Cursor;
};
function unwrapMessageState(
  messagesState: ReturnType<typeof allPaginatedMessagesSelector>
): UnwrappedMessageState {
  const defaultResult: UnwrappedMessageState = {
    error: undefined,
    allMessages: [],
    isLoading: false,
    nextCursor: undefined,
    previousCursor: undefined
  };
  return pot.fold(
    messagesState,
    () => defaultResult,
    () => ({ ...defaultResult, isLoading: true }),
    () => ({ ...defaultResult, isLoading: true }),
    error => ({ ...defaultResult, error }),
    ({ page, previous, next }) => ({
      ...defaultResult,
      allMessages: page,
      nextCursor: next,
      previousCursor: previous
    }),
    ({ page, previous, next }) => ({
      ...defaultResult,
      allMessages: page,
      loading: true,
      nextCursor: next,
      previousCursor: previous
    }),
    ({ page, previous, next }) => ({
      ...defaultResult,
      loading: true,
      allMessages: page,
      nextCursor: next,
      previousCursor: previous
    }),
    ({ page, previous, next }, error) => ({
      ...defaultResult,
      allMessages: page,
      error,
      nextCursor: next,
      previousCursor: previous
    })
  );
}

/**
 * A screen that contains all the Tabs related to messages.
 */
class MessagesHomeScreen extends React.PureComponent<Props, State> {
  navListener?: NavigationEventSubscription;

  animatedTabScrollPositions: ReadonlyArray<Animated.Value> = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0
    };
  }

  componentDidMount() {
    this.props.loadNextPage();
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
    const {
      clientStatusPerMessage,
      isSearchEnabled,
      messagesState,
      navigateToMessageDetail,
      loadNextPage,
      loadPreviousPage,
      servicesById,
      paymentsByRptId,
      updateMessagesArchivedState
    } = this.props;

    const { error, isLoading, allMessages, nextCursor, previousCursor } =
      unwrapMessageState(messagesState);

    // TODO: this horrible mapping is only temporary to avoid duplicating children down the line
    const messagesStateAndStatus = pot.map(messagesState, ({ page }) =>
      page.flatMap(message => {
        const status = clientStatusPerMessage[message.id];
        if (status) {
          return [
            {
              message: pot.some(
                message as unknown as CreatedMessageWithContentAndAttachments
              ),
              clientStatus: status
            }
          ];
        }
        return [];
      })
    );

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
              error={error}
              isLoading={isLoading}
              allMessages={allMessages}
              hasNextPage={!!nextCursor}
              loadNextPage={() => {
                if (nextCursor) {
                  loadNextPage(nextCursor);
                }
              }}
              loadPreviousPage={() => {
                if (previousCursor) {
                  loadPreviousPage(previousCursor);
                }
              }}
              updateMessagesArchivedState={updateMessagesArchivedState}
              servicesById={servicesById}
              paymentsByRptId={paymentsByRptId}
              navigateToMessageDetail={navigateToMessageDetail}
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
                  messagesStateAndStatus={messagesStateAndStatus}
                  servicesById={servicesById}
                  paymentsByRptId={paymentsByRptId}
                  onRefresh={() => {
                    // TODO: this will load the previous page or the entire list?
                  }}
                  navigateToMessageDetail={navigateToMessageDetail}
                  searchText={_}
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
  messagesState: allPaginatedMessagesSelector(state),
  clientStatusPerMessage: messagesStatusSelector(state),
  servicesById: servicesByIdSelector(state),
  paymentsByRptId: paymentsByRptIdSelector(state),
  searchText: searchTextSelector(state),
  messageSectionStatusActive: sectionStatusSelector("messages")(state),
  isSearchEnabled: isSearchMessagesEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reloadAllMessages: () => {
    dispatch(reloadAllMessages.request());
  },
  loadNextPage: (cursor?: Cursor) => {
    dispatch(loadNextPageMessages.request({ pageSize, cursor }));
  },
  loadPreviousPage: (cursor: Cursor) => {
    // We load the maximum amount of messages because we don't actually support
    // true backwards pagination. Is just to refresh the data.
    dispatch(loadNextPageMessages.request({ pageSize: 100, cursor }));
  },
  refreshService: (serviceId: string) => {
    dispatch(loadServiceDetail.request(serviceId));
  },
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageRouterScreen({ messageId })),
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => dispatch(setMessagesArchivedState(ids, archived))
});

export default connect(mapStateToProps, mapDispatchToProps)(MessagesHomeScreen);
