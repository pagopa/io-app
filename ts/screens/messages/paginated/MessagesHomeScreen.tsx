import React, { useContext, useEffect } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { NavigationContext } from "react-navigation";
import { connect } from "react-redux";
import { Millisecond } from "italia-ts-commons/lib/units";

import MessagesSearch from "../../../components/messages/paginated/MessagesSearch";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../../components/search/SearchNoResultMessage";
import SectionStatusComponent from "../../../components/SectionStatus";
import I18n from "../../../i18n";
import { reloadAllMessages } from "../../../store/actions/messages";
import { Dispatch } from "../../../store/actions/types";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../../store/reducers/search";
import { GlobalState } from "../../../store/reducers/types";
import customVariables from "../../../theme/variables";
import { MESSAGE_ICON_HEIGHT } from "../../../utils/constants";
import { setStatusBarColorAndBackground } from "../../../utils/statusBar";
import { sectionStatusSelector } from "../../../store/reducers/backendStatus";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { allMessagesSelector } from "../../../store/reducers/entities/messages/allPaginated";
import { pageSize } from "../../../config";
import MessageList from "../../../components/messages/paginated/MessageList";
import MessagesInbox from "../../../components/messages/paginated/MessagesInbox";
import { navigateToPaginatedMessageDetailScreenAction } from "../../../store/actions/navigation";
import { UIMessage } from "../../../store/reducers/entities/messages/types";

type Props = NavigationStackScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "messages.contextualHelpTitle",
  body: "messages.contextualHelpContent"
};

/**
 * Screen to gather and organize the information for the Inbox and SearchMessage views.
 */
const MessagesHomeScreen = ({
  allMessages,
  isSearchEnabled,
  messageSectionStatusActive,
  reloadFirstPage,
  searchText
}: Props) => {
  const navigation = useContext(NavigationContext);

  const navigateToMessageDetail = (message: UIMessage) => {
    // TODO: https://pagopa.atlassian.net/browse/IA-463
    // if message is a EUCovidCertificate, navigate to the dedicated navigator
    //   navigateToEuCovidCertificate(
    //     message.content.eu_covid_cert.auth_code as EUCovidCertificateAuthCode,
    //     message.id
    //   );
    navigation.dispatch(
      navigateToPaginatedMessageDetailScreenAction({ message })
    );
  };

  useEffect(() => {
    reloadFirstPage();
    const listener = navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "dark-content",
        customVariables.colorWhite
      );
    });
    return () => {
      listener.remove();
    };
  }, []);

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
      <SectionStatusComponent
        sectionKey={"messages"}
        onSectionRef={v => {
          setAccessibilityFocus(v, 100 as Millisecond);
        }}
      />
      {!isSearchEnabled && (
        <React.Fragment>
          <ScreenContentHeader
            title={I18n.t("messages.contentTitle")}
            iconFont={{ name: "io-home-messaggi", size: MESSAGE_ICON_HEIGHT }}
          />
          <MessagesInbox navigateToMessageDetail={navigateToMessageDetail} />
        </React.Fragment>
      )}

      {isSearchEnabled &&
        searchText
          .map(_ =>
            _.length < MIN_CHARACTER_SEARCH_TEXT ? (
              <SearchNoResultMessage errorType="InvalidSearchBarText" />
            ) : (
              <MessagesSearch
                messages={allMessages}
                searchText={_}
                renderSearchResults={results => (
                  <MessageList
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
    </TopScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  allMessages: allMessagesSelector(state),
  isSearchEnabled: isSearchMessagesEnabledSelector(state),
  messageSectionStatusActive: sectionStatusSelector("messages")(state),
  searchText: searchTextSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // used for the first rendering only
  reloadFirstPage: () => {
    dispatch(reloadAllMessages.request({ pageSize }));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MessagesHomeScreen);
