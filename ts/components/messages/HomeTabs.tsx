import React, { useState } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { Tab, Tabs } from "native-base";
import { connect } from "react-redux";

import { IOStyles } from "../core/variables/IOStyles";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { makeFontStyleObject } from "../../theme/fonts";
import { isAndroid } from "../../utils/platform";
import { GlobalState } from "../../store/reducers/types";
import { allMessagesSelector } from "../../store/reducers/entities/messages/allPaginated";
import { Dispatch } from "../../store/actions/types";
import { setMessagesArchivedState } from "../../store/actions/messages";
import { navigateToMessageRouterScreen } from "../../store/actions/navigation";

import MessagesInbox from "./paginated/MessagesInbox";

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
  searchDisableIcon: {
    color: customVariables.headerFontColor
  },
  activeTextStyle: {
    ...makeFontStyleObject(Platform.select, "600"),
    fontSize: isAndroid ? 16 : undefined,
    fontWeight: isAndroid ? "normal" : "bold",
    color: customVariables.brandPrimary
  },
  textStyle: {
    color: customVariables.brandDarkGray
  }
});

const AnimatedTabs = Animated.createAnimatedComponent(Tabs);

type OwnProps = {
  animatedTabScrollPositions: ReadonlyArray<Animated.Value>;
  onTabChange: (i: number) => void;
};

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Render Inbox, Deadlines and Archive tabs.
 */
const HomeTabs = ({
  animatedTabScrollPositions,
  messages,
  navigateToMessageDetail,
  onTabChange,
  updateMessagesArchivedState
}: Props) => {
  const [currentTab, setCurrentTab] = useState(0);
  // Update currentTab state when horizontal scroll is completed
  const handleOnChangeTab = (event: { i: number }) => {
    setCurrentTab(event.i);
    onTabChange(event.i);
  };

  // Disable longPress options the horizontal scroll overcome the 50% of the tab width
  const handleOnTabsScroll = (value: number) => {
    if (Math.abs(value - currentTab) > 0.5) {
      const nextTab = currentTab + (value - currentTab > 0 ? 1 : -1);
      setCurrentTab(nextTab);
      onTabChange(nextTab);
    }
  };

  return (
    <View style={IOStyles.flex}>
      <AnimatedTabs
        tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
        tabBarUnderlineStyle={styles.tabBarUnderlineActive}
        onScroll={handleOnTabsScroll}
        onChangeTab={handleOnChangeTab}
        initialPage={0}
      >
        <Tab
          activeTextStyle={styles.activeTextStyle}
          textStyle={styles.textStyle}
          heading={I18n.t("messages.tab.inbox")}
        >
          <MessagesInbox
            animated={{
              onScroll: Animated.event([
                {
                  nativeEvent: {
                    contentOffset: { y: animatedTabScrollPositions[0] }
                  }
                }
              ]),
              scrollEventThrottle: 8
            }}
            isActive={currentTab === 0}
            messages={messages}
            navigateToMessageDetail={navigateToMessageDetail}
            setMessagesArchivedState={updateMessagesArchivedState}
          />
        </Tab>
      </AnimatedTabs>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  messages: allMessagesSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageRouterScreen({ messageId })),
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => dispatch(setMessagesArchivedState(ids, archived))
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeTabs);
