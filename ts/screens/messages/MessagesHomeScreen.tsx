import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOColors } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { useMessageOpening } from "../../features/messages/hooks/useMessageOpening";
import MessageList from "../../components/messages/MessageList";
import MessagesSearch from "../../components/messages/MessagesSearch";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import SectionStatusComponent from "../../components/SectionStatus";
import FocusAwareStatusBar from "../../components/ui/FocusAwareStatusBar";
import I18n from "../../i18n";
import MessagesHomeTabNavigator from "../../navigation/MessagesHomeTabNavigator";
import {
  migrateToPaginatedMessages,
  resetMigrationStatus
} from "../../store/actions/messages";
import { sectionStatusSelector } from "../../store/reducers/backendStatus";
import {
  allInboxAndArchivedMessagesSelector,
  allPaginatedSelector
} from "../../store/reducers/entities/messages/allPaginated";
import {
  MessagesStatus,
  messagesStatusSelector
} from "../../store/reducers/entities/messages/messagesStatus";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import {
  setAccessibilityFocus,
  useScreenReaderEnabled
} from "../../utils/accessibility";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { showToast } from "../../utils/showToast";
import SecuritySuggestions from "../../features/fastLogin/components/SecuritySuggestions";
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import { useIOSelector } from "../../store/hooks";
import { progressSelector } from "../../store/reducers/identification";
import { isSecurityAdviceAcknowledgedEnabled } from "../../features/fastLogin/store/selectors";
import MigratingMessage from "./MigratingMessage";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "messages.contextualHelpTitle",
  body: "messages.contextualHelpContent"
};

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
  const navigation = useNavigation();
  const [focusCount, setFocusCount] = React.useState(0);

  const {
    present: presentSecuritySuggestionBottomSheet,
    bottomSheet: securitySuggestionBottomSheet,
    dismiss: _dismissSecuritySuggestionBottomSheet
  } = useIOBottomSheetAutoresizableModal({
    title: I18n.t("authentication.opt_in.security_suggests"),
    component: <SecuritySuggestions />,
    fullScreen: true
  });

  const identificationProgressState = useIOSelector(progressSelector);
  const securityAdviceAcknowledged = useIOSelector(
    isSecurityAdviceAcknowledgedEnabled
  );

  const showSecuritySuggestionModal = useCallback(() => {
    if (!securityAdviceAcknowledged) {
      presentSecuritySuggestionBottomSheet();
    }
  }, [presentSecuritySuggestionBottomSheet, securityAdviceAcknowledged]);

  useEffect(() => {
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const unsubscribe = navigation.addListener("focus", () => {
      // During onboarding, the navigation focus event is triggered twice
      setFocusCount(count => count + 1);
      if (focusCount > 0) {
        showSecuritySuggestionModal();
      }
    });

    // Return the function to unsubscribe
    // from the event so it gets removed on unmount
    return unsubscribe;
  }, [
    focusCount,
    identificationProgressState,
    navigation,
    showSecuritySuggestionModal
  ]);

  useEffect(() => {
    // During the current session, we listen to the identification progress state
    // to show the security suggestion bottom sheet when the user is identified
    if (identificationProgressState.kind === "identified") {
      showSecuritySuggestionModal();
    }
  }, [identificationProgressState, focusCount, showSecuritySuggestionModal]);

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

  const { present, bottomSheet } = useMessageOpening();

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
        disableAccessibilityFocus: messageSectionStatusActive
      }}
      hideBaseHeader={!isSearchEnabled}
      accessibilityLabel={I18n.t("messages.contentTitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["messages"]}
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
          {needsMigration ? (
            <MigratingMessage
              status={migrationStatus}
              onRetry={() => migrateMessages(messagesStatus)}
              onEnd={resetMigrationStatus}
            />
          ) : (
            <MessagesHomeTabNavigator />
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
                    onPressItem={present}
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
      {bottomSheet}
      {securitySuggestionBottomSheet}
    </TopScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isSearchEnabled: isSearchMessagesEnabledSelector(state),
  messageSectionStatusActive:
    sectionStatusSelector("messages")(state) !== undefined,
  searchText: searchTextSelector(state),
  searchMessages: allInboxAndArchivedMessagesSelector(state),
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
