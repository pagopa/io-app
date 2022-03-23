import React, { useContext, useEffect } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { NavigationContext } from "react-navigation";
import { connect } from "react-redux";
import {
  Animated,
  Platform,
  StyleSheet,
  View,
  Text,
  ActivityIndicator
} from "react-native";
import { Tab, Tabs } from "native-base";
import { Millisecond } from "italia-ts-commons/lib/units";

import { createSelector } from "reselect";
import MessagesSearch from "../../../components/messages/paginated/MessagesSearch";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../../components/search/SearchNoResultMessage";
import SectionStatusComponent from "../../../components/SectionStatus";
import I18n from "../../../i18n";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../../store/reducers/search";
import { GlobalState } from "../../../store/reducers/types";
import { MESSAGE_ICON_HEIGHT } from "../../../utils/constants";
import { sectionStatusSelector } from "../../../store/reducers/backendStatus";
import {
  setAccessibilityFocus,
  useScreenReaderEnabled
} from "../../../utils/accessibility";
import MessageList from "../../../components/messages/paginated/MessageList";
import MessagesInbox from "../../../components/messages/paginated/MessagesInbox";
import { navigateToPaginatedMessageRouterAction } from "../../../store/actions/navigation";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import customVariables from "../../../theme/variables";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { makeFontStyleObject } from "../../../theme/fonts";
import MessagesArchive from "../../../components/messages/paginated/MessagesArchive";
import {
  allArchiveMessagesSelector,
  allInboxMessagesSelector,
  allPaginatedSelector,
  MigrationStatus
} from "../../../store/reducers/entities/messages/allPaginated";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import _ from "lodash";
import {
  DEPRECATED_setMessageReadState,
  DEPRECATED_setMessagesArchivedState,
  migrateToPaginatedMessages
} from "../../../store/actions/messages";
import {
  MessagesStatus,
  messagesStatusSelector
} from "../../../store/reducers/entities/messages/messagesStatus";
import { H2 } from "../../../components/core/typography/H2";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { InfoBox } from "../../../components/box/InfoBox";
import IconFont from "../../../components/ui/IconFont";
import { IOColors } from "../../../components/core/variables/IOColors";

type Props = NavigationStackScreenProps & ReturnType<typeof mapStateToProps>;

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
  },

  // migration part
  migrationMessageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 60
  },
  migrationIconContainer: {
    height: 80
  },
  migrationMessageText: {
    textAlign: "center",
    // marginTop: 40,
    marginBottom: 40
  },
  migrationMessageButtonText: {
    color: IOColors.white
  },
  activityIndicator: {
    padding: 12
  }
});

const AnimatedTabs = Animated.createAnimatedComponent(Tabs);

type AllTabsProps = {
  navigateToMessageDetail: (message: UIMessage) => void;
};

const AllTabs = ({ navigateToMessageDetail }: AllTabsProps) => (
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
        <MessagesInbox navigateToMessageDetail={navigateToMessageDetail} />
      </Tab>

      <Tab
        activeTextStyle={styles.activeTextStyle}
        textStyle={styles.textStyle}
        heading={I18n.t("messages.tab.archive")}
      >
        <MessagesArchive navigateToMessageDetail={navigateToMessageDetail} />
      </Tab>
    </AnimatedTabs>
  </View>
);

type MigratingMessageProps = { status: MigrationStatus; onRetry: () => void };
const MigratingMessage = ({ status, onRetry }: MigratingMessageProps) =>
  status.fold(null, ongoing => {
    // eslint-disable-next-line no-underscore-dangle
    switch (ongoing._tag) {
      case "failed":
        return (
          <View style={styles.migrationMessageContainer}>
            <View style={styles.migrationIconContainer}>
              <IconFont size={48} color={IOColors.blue} name={"io-sad"} />
            </View>
            <H2 style={styles.migrationMessageText}>
              {I18n.t("messages.pagination.migration.failed")}
            </H2>
            <ButtonDefaultOpacity
              primary={false}
              disabled={false}
              onPress={onRetry}
              style={{ width: "100%" }}
            >
              <Text style={styles.migrationMessageButtonText}>
                {I18n.t("global.buttons.retry")}
              </Text>
            </ButtonDefaultOpacity>
          </View>
        );
      case "succeeded":
        return (
          <View style={styles.migrationMessageContainer}>
            <View style={styles.migrationIconContainer}>
              <IconFont size={48} color={IOColors.blue} name={"io-happy"} />
            </View>
            <H2 style={styles.migrationMessageText}>
              {I18n.t("messages.pagination.migration.succeeded")}
            </H2>
          </View>
        );
      case "started":
        return (
          <View style={styles.migrationMessageContainer}>
            <View style={styles.migrationIconContainer}>
              <ActivityIndicator
                animating={true}
                size={"large"}
                style={styles.activityIndicator}
                color={customVariables.brandPrimary}
                accessible={true}
                accessibilityHint={I18n.t(
                  "global.accessibility.activityIndicator.hint"
                )}
                accessibilityLabel={I18n.t(
                  "global.accessibility.activityIndicator.label"
                )}
                importantForAccessibility={"no-hide-descendants"}
                testID={"activityIndicator"}
              />
            </View>
            <H2 style={styles.migrationMessageText}>
              {I18n.t("messages.pagination.migration.started")}
            </H2>
          </View>
        );
    }
  });

/**
 * Screen to gather and organize the information for the Inbox and SearchMessage views.
 */
const MessagesHomeScreen = ({
  isSearchEnabled,
  messageSectionStatusActive,
  searchMessages,
  searchText,

  // migration
  inbox,
  messagesStatus,
  migrateMessages,
  migrationStatus
}: Props) => {
  const navigation = useContext(NavigationContext);

  // useEffect(() => {
  //   setTimeout(() => {
  //     _.shuffle(inbox)
  //       .slice(0, inbox.length)
  //       .forEach(message => {
  //         console.log(message.id);
  //         dispatch(DEPRECATED_setMessageReadState(message.id, true, "unknown"));
  //         dispatch(DEPRECATED_setMessagesArchivedState([message.id], true));
  //       });
  //   }, 5000);
  // }, [inbox]);

  const needsMigration = Object.keys(messagesStatus).length > 0;

  useOnFirstRender(() => {
    if (needsMigration) {
      migrateMessages(messagesStatus);
    }
  });

  const navigateToMessageDetail = (message: UIMessage) => {
    navigation.dispatch(
      navigateToPaginatedMessageRouterAction({
        messageId: message.id,
        isArchived: message.isArchived
      })
    );
  };

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
            />
          ) : (
            <AllTabs navigateToMessageDetail={navigateToMessageDetail} />
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

  // TEMP
  inbox: allInboxMessagesSelector(state),
  messagesStatus: messagesStatusSelector(state),
  migrationStatus: allPaginatedSelector(state).migration
});

export default connect(mapStateToProps, dispatch => ({
  migrateMessages: (messageStatus: MessagesStatus) => {
    dispatch(migrateToPaginatedMessages.request(messageStatus));
  }
}))(MessagesHomeScreen);
