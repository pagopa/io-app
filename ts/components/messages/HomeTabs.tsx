import React, { useState } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { Tab, Tabs } from "native-base";

import { IOStyles } from "../core/variables/IOStyles";
import I18n from "../../i18n";
import { UIMessage } from "../../store/reducers/entities/messages/types";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import customVariables from "../../theme/variables";
import { makeFontStyleObject } from "../../theme/fonts";

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
    fontSize: Platform.OS === "android" ? 16 : undefined,
    fontWeight: Platform.OS === "android" ? "normal" : "bold",
    color: customVariables.brandPrimary
  },
  textStyle: {
    color: customVariables.brandDarkGray
  }
});

const AnimatedTabs = Animated.createAnimatedComponent(Tabs);

type Props = {
  allMessages: ReadonlyArray<UIMessage>;
  animatedTabScrollPositions: ReadonlyArray<Animated.Value>;
  error?: string;
  hasNextPage: boolean;
  isLoading: boolean;
  loadNextPage: () => void;
  loadPreviousPage: () => void;
  navigateToMessageDetail: (id: string) => void;
  onTabChange: (i: number) => void;
  paymentsByRptId: PaymentByRptIdState;
  servicesById: ServicesByIdState;
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => void;
};

/**
 * Render Inbox, Deadlines and Archive tabs.
 */
const HomeTabs = ({
  allMessages,
  animatedTabScrollPositions,
  error,
  // hasNextPage,
  isLoading,
  loadNextPage,
  loadPreviousPage,
  navigateToMessageDetail,
  onTabChange,
  // paymentsByRptId,
  // servicesById,
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
            currentTab={currentTab}
            error={error}
            isLoading={isLoading}
            messages={allMessages}
            navigateToMessageDetail={navigateToMessageDetail}
            onPreviousPage={loadPreviousPage}
            onNextPage={loadNextPage}
            setMessagesArchivedState={updateMessagesArchivedState}
          />
        </Tab>
      </AnimatedTabs>
    </View>
  );
};

export default HomeTabs;
