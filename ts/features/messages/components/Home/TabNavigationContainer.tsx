import { MutableRefObject, useCallback } from "react";

import { StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { TabItem, TabNavigation } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../../store/hooks";
import { shownMessageCategorySelector } from "../../store/reducers/allPaginated";
import { messageListCategoryToViewPageIndex } from "./homeUtils";

const styles = StyleSheet.create({
  tabContainer: {
    paddingVertical: 8
  }
});

export const TabNavigationContainer = ({
  pagerViewRef
}: {
  pagerViewRef: MutableRefObject<PagerView | null>;
}) => {
  const shownMessageCategory = useIOSelector(shownMessageCategorySelector);
  const shownPageIndex =
    messageListCategoryToViewPageIndex(shownMessageCategory);
  const onTabNavigationItemPressed = useCallback(
    (selectedTabIndex: number) => {
      if (shownPageIndex !== selectedTabIndex) {
        // The PagerViewContainer is used to pilot the business logic
        // that both switches page and trigger the redux store update
        // to re-render this component
        pagerViewRef.current?.setPage(selectedTabIndex);
      }
    },
    [pagerViewRef, shownPageIndex]
  );
  return (
    <View style={styles.tabContainer}>
      <TabNavigation
        onItemPress={onTabNavigationItemPressed}
        tabAlignment="start"
        selectedIndex={shownPageIndex}
      >
        <TabItem
          accessibilityLabel={I18n.t(`messages.tab.inbox`)}
          icon={"inbox"}
          iconSelected={"inboxFilled"}
          key={`messages_home_tab_inbox`}
          label={I18n.t(`messages.tab.inbox`)}
          testID={"home_tab_item_inbox"}
        />
        <TabItem
          accessibilityLabel={I18n.t(`messages.tab.archive`)}
          icon={"archive"}
          iconSelected={"archiveFilled"}
          key={`messages_home_tab_archived`}
          label={I18n.t(`messages.tab.archive`)}
          testID={"home_tab_item_archive"}
        />
      </TabNavigation>
    </View>
  );
};
