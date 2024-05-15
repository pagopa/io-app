import {
  Body,
  IOStyles,
  TabItem,
  TabNavigation
} from "@pagopa/io-app-design-system";
import React, { useCallback, useRef, useState } from "react";
import { NativeSyntheticEvent, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { OnPageSelectedEventData } from "react-native-pager-view/lib/typescript/PagerViewNativeComponent";
import I18n from "../../../i18n";

const styles = StyleSheet.create({
  tabContainer: {
    paddingVertical: 8
  },
  tempPagerViewContainer: {
    alignItems: "center",
    justifyContent: "center"
  }
});

export const MessagesHomeScreen = () => {
  const pagerViewRef = useRef<PagerView | null>(null);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const onTabNavigationItemPressed = useCallback(
    selectedTabIndex => {
      if (tabIndex !== selectedTabIndex) {
        setTabIndex(selectedTabIndex);
        pagerViewRef.current?.setPage(selectedTabIndex);
      }
    },
    [tabIndex]
  );
  const onPagerViewPageSelected = useCallback(
    (selectionEvent: NativeSyntheticEvent<OnPageSelectedEventData>) => {
      const selectedTabIndex = selectionEvent.nativeEvent.position;
      if (tabIndex !== selectedTabIndex) {
        setTabIndex(selectedTabIndex);
      }
    },
    [tabIndex]
  );
  return (
    <View style={IOStyles.flex}>
      <View style={styles.tabContainer}>
        <TabNavigation
          onItemPress={onTabNavigationItemPressed}
          tabAlignment="start"
          selectedIndex={tabIndex}
        >
          <TabItem
            key={`messages_home_tab_inbox`}
            label={I18n.t(`messages.tab.inbox`)}
            accessibilityLabel={I18n.t(`messages.tab.inbox`)}
            icon={"inbox"}
            iconSelected={"inboxFilled"}
          />
          <TabItem
            key={`messages_home_tab_archived`}
            label={I18n.t(`messages.tab.archive`)}
            accessibilityLabel={I18n.t(`messages.tab.archive`)}
            icon={"archive"}
            iconSelected={"archiveFilled"}
          />
        </TabNavigation>
      </View>
      <PagerView
        style={IOStyles.flex}
        initialPage={tabIndex}
        onPageSelected={onPagerViewPageSelected}
        ref={pagerViewRef}
      >
        <View style={styles.tempPagerViewContainer} key="messages_home_1">
          <Body>{`Ricevuti in sviluppo`}</Body>
        </View>
        <View style={styles.tempPagerViewContainer} key="messages_home_2">
          <Body>{`Archiviati in sviluppo`}</Body>
        </View>
      </PagerView>
    </View>
  );
};
