import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect } from "react";
import { connect, useSelector } from "react-redux";
import { Dispatch } from "redux";

import { createSelector } from "reselect";
import { useNavigation } from "@react-navigation/native";
import { LevelEnum } from "../../../definitions/content/SectionStatus";
import { IOColors } from "../../components/core/variables/IOColors";
import { useMessageOpening } from "../../features/messages/hooks/useMessageOpening";
import MessageList from "../../components/messages/MessageList";
import MessagesSearch from "../../components/messages/MessagesSearch";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import SectionStatusComponent, {
  InnerSectionStatus
} from "../../components/SectionStatus";
import FocusAwareStatusBar from "../../components/ui/FocusAwareStatusBar";
import { itWalletEnabled, unsupportedDeviceMoreInfoUrl } from "../../config";
import { lollipopPublicKeySelector } from "../../features/lollipop/store/reducers/lollipop";
import I18n from "../../i18n";
import MessagesHomeTabNavigator from "../../navigation/MessagesHomeTabNavigator";
import {
  migrateToPaginatedMessages,
  resetMigrationStatus
} from "../../store/actions/messages";
import { useIOSelector } from "../../store/hooks";
import {
  isLollipopEnabledSelector,
  sectionStatusSelector
} from "../../store/reducers/backendStatus";
import {
  allArchiveMessagesSelector,
  allInboxMessagesSelector,
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

import ROUTES from "../../navigation/routes";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import { MESSAGE_ICON_HEIGHT } from "../../utils/constants";
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

  const publicKeyOption = useSelector(lollipopPublicKeySelector);

  const navigation = useNavigation();

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

  const isLollipopEnabled = useIOSelector(isLollipopEnabledSelector);
  const showUnsupportedDeviceBanner =
    isLollipopEnabled && O.isNone(publicKeyOption);
  const unsupportedDevicesStatusComponent = showUnsupportedDeviceBanner && (
    <InnerSectionStatus
      sectionKey={"messages"}
      sectionStatus={{
        is_visible: true,
        level: LevelEnum.warning,
        web_url: {
          "it-IT": unsupportedDeviceMoreInfoUrl,
          "en-EN": unsupportedDeviceMoreInfoUrl
        },
        message: {
          "it-IT": I18n.t("unsupportedDevice.warning"),
          "en-EN": I18n.t("unsupportedDevice.warning")
        }
      }}
    />
  );

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
      isSearchAvailable={{ enabled: true, searchType: "Messages" }}
      isProfileAvailable={{
        enabled: true,
        onProfileTap: () =>
          navigation.getParent()?.navigate(ROUTES.PROFILE_NAVIGATOR)
      }}
      sectionTitle={
        itWalletEnabled ? I18n.t("messages.contentTitle") : undefined
      }
      appLogo={itWalletEnabled ? false : true}
    >
      <FocusAwareStatusBar
        barStyle={"dark-content"}
        backgroundColor={IOColors.white}
      />
      {isScreenReaderEnabled && statusComponent}
      {isScreenReaderEnabled && unsupportedDevicesStatusComponent}
      {!isSearchEnabled && (
        <React.Fragment>
          {!itWalletEnabled && (
            <ScreenContentHeader
              title={I18n.t("messages.contentTitle")}
              iconFont={{ name: "io-home-messaggi", size: MESSAGE_ICON_HEIGHT }}
            />
          )}
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
      {!isScreenReaderEnabled && unsupportedDevicesStatusComponent}
      {bottomSheet}
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
