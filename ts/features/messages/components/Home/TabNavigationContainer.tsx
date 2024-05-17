import React, { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { TabItem, TabNavigation } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { shownMessageCategorySelector } from "../../store/reducers/allPaginated";
import { setShownMessageCategoryAction } from "../../store/actions";
import {
  getInitialReloadAllMessagesActionIfNeeded,
  messageListCategoryToViewPageIndex,
  messageViewPageIndexToListCategory
} from "./homeUtils";

const styles = StyleSheet.create({
  tabContainer: {
    paddingVertical: 8
  }
});

export const TabNavigationContainer = ({
  pagerViewRef
}: {
  pagerViewRef: React.MutableRefObject<PagerView | null>;
}) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const shownMessageCategory = useIOSelector(shownMessageCategorySelector);
  const shownPageIndex =
    messageListCategoryToViewPageIndex(shownMessageCategory);
  const onTabNavigationItemPressed = useCallback(
    (selectedTabIndex: number) => {
      if (shownPageIndex !== selectedTabIndex) {
        const selectedShownCategory =
          messageViewPageIndexToListCategory(selectedTabIndex);
        dispatch(setShownMessageCategoryAction(selectedShownCategory));
        pagerViewRef.current?.setPage(selectedTabIndex);
      }
    },
    [dispatch, pagerViewRef, shownPageIndex]
  );
  useEffect(() => {
    const state = store.getState();
    const reloadAllMessagesActionOrUndefined =
      getInitialReloadAllMessagesActionIfNeeded(state);
    if (reloadAllMessagesActionOrUndefined) {
      dispatch(reloadAllMessagesActionOrUndefined);
    }
  }, [dispatch, shownMessageCategory, store]);
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
