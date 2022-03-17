import { CompatNavigationProp } from "@react-navigation/compat";
import { useNavigation } from "@react-navigation/native";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Tab, Tabs } from "native-base";
import React from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { connect } from "react-redux";
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
import { sectionStatusSelector } from "../../../store/reducers/backendStatus";
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

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<MainTabParamsList, "MESSAGES_HOME">
  >;
} & ReturnType<typeof mapStateToProps>;

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
};

const AllTabs = ({ navigateToMessageDetail }: AllTabsProps) => (
  <View style={IOStyles.flex}>
    <AnimatedTabs
      tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
      tabBarUnderlineStyle={styles.tabBarUnderlineActive}
      // onScroll={handleOnTabsScroll}
      // onChangeTab={handleOnChangeTab}
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

/**
 * Screen to gather and organize the information for the Inbox and SearchMessage views.
 */
const MessagesHomeScreen = ({
  isSearchEnabled,
  messageSectionStatusActive,
  searchText
}: Props) => {
  const navigation = useNavigation();

  const navigateToMessageDetail = (message: UIMessage) => {
    navigation.navigate(ROUTES.MESSAGE_ROUTER_PAGINATED, {
      messageId: message.id,
      isArchived: message.isArchived
    });
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
          <AllTabs navigateToMessageDetail={navigateToMessageDetail} />
        </React.Fragment>
      )}

      {isSearchEnabled &&
        searchText
          .map(_ =>
            _.length < MIN_CHARACTER_SEARCH_TEXT ? (
              <SearchNoResultMessage errorType="InvalidSearchBarText" />
            ) : (
              <MessagesSearch
                messages={[]}
                searchText={_}
                renderSearchResults={results => (
                  // TODO: filter may happen down the line
                  <MessageList
                    filter={{ getArchived: false }}
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
  searchText: searchTextSelector(state)
});

export default connect(mapStateToProps, undefined)(MessagesHomeScreen);
