import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { CompatNavigationProp } from "@react-navigation/compat";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { createSelector } from "reselect";
import { makeFontStyleObject } from "../../../components/core/fonts";
import { IOColors } from "../../../components/core/variables/IOColors";
import { useMessageOpening } from "../../../components/messages/paginated/hooks/useMessageOpening";
import MessageList from "../../../components/messages/paginated/MessageList";
import MessagesSearch from "../../../components/messages/paginated/MessagesSearch";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../../components/search/SearchNoResultMessage";
import SectionStatusComponent from "../../../components/SectionStatus";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";
import I18n from "../../../i18n";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../../navigation/params/MainTabParamsList";
import {
  migrateToPaginatedMessages,
  resetMigrationStatus
} from "../../../store/actions/messages";
import { sectionStatusSelector } from "../../../store/reducers/backendStatus";
import {
  allArchiveMessagesSelector,
  allInboxMessagesSelector,
  allPaginatedSelector
} from "../../../store/reducers/entities/messages/allPaginated";
import {
  MessagesStatus,
  messagesStatusSelector
} from "../../../store/reducers/entities/messages/messagesStatus";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../../store/reducers/search";
import { GlobalState } from "../../../store/reducers/types";
import {
  setAccessibilityFocus,
  useScreenReaderEnabled
} from "../../../utils/accessibility";
import { MESSAGE_ICON_HEIGHT } from "../../../utils/constants";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { showToast } from "../../../utils/showToast";
import MessagesArchiveScreen from "./MessagesArchiveScreen";
import MessagesInboxScreen from "./MessagesInboxScreen";

import MigratingMessage from "./MigratingMessage";

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<MainTabParamsList, "MESSAGES_HOME">
  >;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "messages.contextualHelpTitle",
  body: "messages.contextualHelpContent"
};

const Tab = createMaterialTopTabNavigator();

const AllTabs = () => (
  <Tab.Navigator
    initialRouteName="MESSAGES_INBOX"
    tabBarPosition="top"
    tabBarOptions={{
      activeTintColor: IOColors.blue,
      labelStyle: {
        ...makeFontStyleObject("SemiBold"),
        fontSize: Platform.OS === "android" ? 16 : undefined,
        fontWeight: Platform.OS === "android" ? "normal" : "bold",
        textTransform: "capitalize"
      }
    }}
  >
    <Tab.Screen
      name={"MESSAGES_INBOX"}
      options={{
        title: I18n.t("messages.tab.inbox")
      }}
      component={MessagesInboxScreen}
    />
    <Tab.Screen
      name={"MESSAGES_ARCHIVE"}
      options={{
        title: I18n.t("messages.tab.archive")
      }}
      component={MessagesArchiveScreen}
    />
  </Tab.Navigator>
);

/**
 * Screen to gather and organize the information for the Inbox and SearchMessage views.
 */
const MessagesHomeScreen = ({
  isSearchEnabled,
  messageSectionStatusActive,
  searchMessages,
  searchText,

  // migration
  messagesStatus,
  migrateMessages,
  migrationStatus,
  resetMigrationStatus,
  latestMessageOperation
}: Props) => {
  const needsMigration = Object.keys(messagesStatus).length > 0;

  useOnFirstRender(() => {
    if (needsMigration) {
      migrateMessages(messagesStatus);
    }
  });

  useEffect(() => {
    if (!latestMessageOperation) {
      return;
    }

    pipe(
      latestMessageOperation,
      E.foldW(
        l => ({
          operation: l.operation,
          archive: I18n.t("messages.operations.archive.failure"),
          restore: I18n.t("messages.operations.restore.failure"),
          type: "danger" as const
        }),
        r => ({
          operation: r,
          archive: I18n.t("messages.operations.archive.success"),
          restore: I18n.t("messages.operations.restore.success"),
          type: "success" as const
        })
      ),
      lmo => showToast(lmo[lmo.operation], lmo.type)
    );
  }, [latestMessageOperation]);

  const { openMessage, bottomSheets } = useMessageOpening();

  const isScreenReaderEnabled = useScreenReaderEnabled();

  const statusComponent = (
    <SectionStatusComponent
      sectionKey={"messages"}
      onSectionRef={v => {
        setAccessibilityFocus(v, 100 as Millisecond);
      }}
    />
  );

  return (
    <TopScreenComponent
      accessibilityEvents={{
        disableAccessibilityFocus: messageSectionStatusActive !== undefined
      }}
      accessibilityLabel={I18n.t("messages.contentTitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["messages"]}
      headerTitle={I18n.t("messages.contentTitle")}
      isSearchAvailable={{ enabled: true, searchType: "Messages" }}
      appLogo={true}
    >
      <FocusAwareStatusBar
        barStyle={"dark-content"}
        backgroundColor={IOColors.white}
      />
      {isScreenReaderEnabled && statusComponent}
      {!isSearchEnabled && (
        <React.Fragment>
          <ScreenContentHeader
            title={I18n.t("messages.contentTitle")}
            iconFont={{ name: "io-home-messaggi", size: MESSAGE_ICON_HEIGHT }}
          />
          {needsMigration ? (
            <MigratingMessage
              status={migrationStatus}
              onRetry={() => migrateMessages(messagesStatus)}
              onEnd={resetMigrationStatus}
            />
          ) : (
            <AllTabs />
          )}
        </React.Fragment>
      )}

      {isSearchEnabled &&
        pipe(
          searchText,
          O.map(_ =>
            _.length < MIN_CHARACTER_SEARCH_TEXT ? (
              <SearchNoResultMessage errorType="InvalidSearchBarText" />
            ) : (
              <MessagesSearch
                messages={searchMessages}
                searchText={_}
                renderSearchResults={results => (
                  <MessageList
                    filter={{}}
                    filteredMessages={results}
                    onPressItem={openMessage}
                  />
                )}
              />
            )
          ),
          O.getOrElse(() => (
            <SearchNoResultMessage errorType="InvalidSearchBarText" />
          ))
        )}
      {!isScreenReaderEnabled && statusComponent}
      {bottomSheets.map(_ => _)}
    </TopScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isSearchEnabled: isSearchMessagesEnabledSelector(state),
  messageSectionStatusActive: sectionStatusSelector("messages")(state),
  searchText: searchTextSelector(state),
  searchMessages: createSelector(
    [allInboxMessagesSelector, allArchiveMessagesSelector],
    (inbox, archive) => inbox.concat(archive)
  )(state),
  messagesStatus: messagesStatusSelector(state),
  migrationStatus: allPaginatedSelector(state).migration,
  latestMessageOperation: allPaginatedSelector(state).latestMessageOperation
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  migrateMessages: (messageStatus: MessagesStatus) => {
    dispatch(migrateToPaginatedMessages.request(messageStatus));
  },
  resetMigrationStatus: () => dispatch(resetMigrationStatus())
});

export default connect(mapStateToProps, mapDispatchToProps)(MessagesHomeScreen);
