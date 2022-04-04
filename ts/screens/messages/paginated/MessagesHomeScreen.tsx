import { CompatNavigationProp } from "@react-navigation/compat";
import { useNavigation } from "@react-navigation/native";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Tab, Tabs } from "native-base";
import React from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { connect, useDispatch } from "react-redux";
import { Dispatch } from "redux";

import { createSelector } from "reselect";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import MessageList from "../../../components/messages/paginated/MessageList";
import MessagesArchive from "../../../components/messages/paginated/MessagesArchive";
import MessagesInbox from "../../../components/messages/paginated/MessagesInbox";
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
import ROUTES from "../../../navigation/routes";
import {
  migrateToPaginatedMessages,
  resetMigrationStatus,
  upsertMessageStatusAttributes
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
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../../store/reducers/search";
import { GlobalState } from "../../../store/reducers/types";
import { makeFontStyleObject } from "../../../theme/fonts";
import customVariables from "../../../theme/variables";
import {
  setAccessibilityFocus,
  useScreenReaderEnabled
} from "../../../utils/accessibility";
import { MESSAGE_ICON_HEIGHT } from "../../../utils/constants";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
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

const styles = StyleSheet.create({
  tabBarContainer: {
    elevation: 0,
    height: 40
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.tabUnderlineColor,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  tabBarUnderlineActive: {
    height: customVariables.tabUnderlineHeight,
    // borders do not overlap each other, but stack naturally
    marginBottom: -customVariables.tabUnderlineHeight,
    backgroundColor: customVariables.contentPrimaryBackground
  },
  activeTextStyle: {
    ...makeFontStyleObject(Platform.select, "600"),
    fontSize: Platform.OS === "android" ? 16 : undefined,
    fontWeight: Platform.OS === "android" ? "normal" : "bold",
    color: customVariables.brandPrimary
  },
  textStyle: {
    color: customVariables.brandDarkGray
  }
});

const AnimatedTabs = Animated.createAnimatedComponent(Tabs);

type AllTabsProps = {
  navigateToMessageDetail: (message: UIMessage) => void;
  inbox: ReadonlyArray<UIMessage>;
  archive: ReadonlyArray<UIMessage>;
  setArchived: (
    isArchived: boolean,
    messages: ReadonlyArray<UIMessage>
  ) => void;
};

const AllTabs = ({
  navigateToMessageDetail,
  inbox,
  archive,
  setArchived
}: AllTabsProps) => (
  <View style={IOStyles.flex}>
    <AnimatedTabs
      tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
      tabBarUnderlineStyle={styles.tabBarUnderlineActive}
      initialPage={0}
    >
      <Tab
        activeTextStyle={styles.activeTextStyle}
        textStyle={styles.textStyle}
        heading={I18n.t("messages.tab.inbox")}
      >
        <MessagesInbox
          messages={inbox}
          navigateToMessageDetail={navigateToMessageDetail}
          archiveMessages={messages => setArchived(true, messages)}
        />
      </Tab>

      <Tab
        activeTextStyle={styles.activeTextStyle}
        textStyle={styles.textStyle}
        heading={I18n.t("messages.tab.archive")}
      >
        <MessagesArchive
          messages={archive}
          navigateToMessageDetail={navigateToMessageDetail}
          unarchiveMessages={messages => setArchived(false, messages)}
        />
      </Tab>
    </AnimatedTabs>
  </View>
);

/**
 * Screen to gather and organize the information for the Inbox and SearchMessage views.
 */
const MessagesHomeScreen = ({
  isSearchEnabled,
  messageSectionStatusActive,
  searchMessages,
  searchText,
  allInboxMessages,
  allArchiveMessages,

  // migration
  messagesStatus,
  migrateMessages,
  migrationStatus,
  resetMigrationStatus
}: Props) => {
  const navigation = useNavigation();
  const needsMigration = Object.keys(messagesStatus).length > 0;

  useOnFirstRender(() => {
    if (needsMigration) {
      migrateMessages(messagesStatus);
    }
  });

  const navigateToMessageDetail = (message: UIMessage) => {
    navigation.navigate(ROUTES.MESSAGE_ROUTER_PAGINATED, {
      messageId: message.id,
      isArchived: message.isArchived
    });
  };

  const dispatch = useDispatch();

  const setArchived = (
    isArchived: boolean,
    messages: ReadonlyArray<UIMessage>
  ) =>
    messages.forEach(message =>
      dispatch(
        upsertMessageStatusAttributes.request({
          message,
          update: { tag: "archiving", isArchived }
        })
      )
    );

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
        backgroundColor={customVariables.colorWhite}
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
            <AllTabs
              inbox={allInboxMessages}
              archive={allArchiveMessages}
              navigateToMessageDetail={navigateToMessageDetail}
              setArchived={setArchived}
            />
          )}
        </React.Fragment>
      )}

      {isSearchEnabled &&
        searchText
          .map(_ =>
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
                    onPressItem={navigateToMessageDetail}
                  />
                )}
              />
            )
          )
          .getOrElse(
            <SearchNoResultMessage errorType="InvalidSearchBarText" />
          )}
      {!isScreenReaderEnabled && statusComponent}
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
  allInboxMessages: allInboxMessagesSelector(state),
  allArchiveMessages: allArchiveMessagesSelector(state),
  messagesStatus: messagesStatusSelector(state),
  migrationStatus: allPaginatedSelector(state).migration
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  migrateMessages: (messageStatus: MessagesStatus) => {
    dispatch(migrateToPaginatedMessages.request(messageStatus));
  },
  resetMigrationStatus: () => dispatch(resetMigrationStatus())
});

export default connect(mapStateToProps, mapDispatchToProps)(MessagesHomeScreen);
