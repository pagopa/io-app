import { TabItem, TabNavigation } from "@io-app/design-system";
import I18n from "i18next";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { MessageListCategory } from "../../types/messageListCategory";
import { messageListCategoryToViewPageIndex } from "./homeUtils";

const styles = StyleSheet.create({
  tabContainer: {
    paddingVertical: 8
  }
});

type TabNavigationContainerProps = {
  currentCategory: MessageListCategory;
  onTabPressed: (selectedTabIndex: number) => void;
};

export const TabNavigationContainer = memo(
  ({ currentCategory, onTabPressed }: TabNavigationContainerProps) => (
    <View style={styles.tabContainer}>
      <TabNavigation
        onItemPress={onTabPressed}
        selectedIndex={messageListCategoryToViewPageIndex(currentCategory)}
        tabAlignment="start"
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
  )
);
