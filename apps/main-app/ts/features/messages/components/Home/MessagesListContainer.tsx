import { useFocusEffect } from "@react-navigation/native";
import { FlashListRef } from "@shopify/flash-list";
import { useCallback, useEffect, useRef, useState } from "react";

import SectionStatusComponent from "../../../../components/SectionStatus";
import { pageSize } from "../../../../config";
import { useTabItemPressWhenScreenActive } from "../../../../hooks/useTabItemPressWhenScreenActive";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { trackAutoRefresh, trackMessagesPage } from "../../analytics";
import { setShownMessageCategoryAction } from "../../store/actions";
import {
  messageCountForCategorySelector,
  shownMessageCategorySelector
} from "../../store/reducers/allPaginated";
import { MessageListCategory } from "../../types/messageListCategory";
import { ArchiveRestoreBar } from "./ArchiveRestoreBar";
import {
  getInitialReloadAllMessagesActionIfNeeded,
  getLoadPreviousPageMessagesActionIfAllowed,
  messageListCategoryToViewPageIndex,
  messageViewPageIndexToListCategory,
  trackMessagePageOnFocusEventIfAllowed
} from "./homeUtils";
import { MessageList, MessageListItem } from "./MessageList";
import { TabNavigationContainer } from "./TabNavigationContainer";

/** Loads and tracks the selected category and handles Messages tab reselection. */
export const MessagesListContainer = () => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const listRef = useRef<FlashListRef<MessageListItem>>(null);
  // Local state drives rendering so a tab press updates the UI in the same
  // render pass, without waiting for a Redux round-trip. The store is only
  // read once to seed the initial value and is kept in sync on every change.
  const [category, setCategory] = useState<MessageListCategory>(() =>
    shownMessageCategorySelector(store.getState())
  );

  const onTabPressedCallback = useCallback(() => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, []);

  const loadNewlyReceivedMessagesIfNeededCallback = useCallback(() => {
    const state = store.getState();
    const loadPreviousPageAction =
      getLoadPreviousPageMessagesActionIfAllowed(state);
    if (loadPreviousPageAction) {
      trackAutoRefresh(shownMessageCategorySelector(state));
      dispatch(loadPreviousPageAction);
    }
  }, [dispatch, store]);

  useEffect(() => {
    // Runs on first render and on every category switch. The store already
    // holds the new category at this point, since `setShownMessageCategoryAction`
    // is dispatched synchronously together with `setCategory`.
    const state = store.getState();
    const messageCount = messageCountForCategorySelector(state, category);
    trackMessagesPage(category, messageCount, pageSize, true);
    const reloadAction = getInitialReloadAllMessagesActionIfNeeded(state);
    if (reloadAction) {
      dispatch(reloadAction);
    }
    // Does nothing if the reload above was already requested: it only
    // refreshes the list when switching tabs without leaving the screen.
    loadNewlyReceivedMessagesIfNeededCallback();
  }, [category, dispatch, loadNewlyReceivedMessagesIfNeededCallback, store]);

  useTabItemPressWhenScreenActive(onTabPressedCallback, false);
  useFocusEffect(
    useCallback(() => {
      // This hook has two use-cases:
      // - to send an analytics event on first landing, when there
      //   is a change-back using the messages bottom tab and when
      //   the user navigates back from a message details;
      // - to check if there are new messages (on the server) when
      //   there is a change-back using the messages bottom tab and
      //  when the user navigates back from a message details.
      // The timeout is needed:
      // - during onboarding, where a screen is mounted on top of the
      //   main navigation tab, thus avoiding a momentary focus of
      //   the selected tab (which is normally the messages one);
      // - to avoid a glitch with the FlatList that does not update
      //   the pull-to-refresh margins after the check has completed
      //   (what happens is that the pull-to-refresh control disappears
      //   but the list keeps its blank view placeholder visible).
      setTimeout(() => {
        const state = store.getState();
        trackMessagePageOnFocusEventIfAllowed(state);
        loadNewlyReceivedMessagesIfNeededCallback();
      }, 100);
    }, [loadNewlyReceivedMessagesIfNeededCallback, store])
  );

  const onTabNavigationItemPressed = useCallback(
    (selectedTabIndex: number) => {
      if (messageListCategoryToViewPageIndex(category) === selectedTabIndex) {
        return;
      }
      const newCategory = messageViewPageIndexToListCategory(selectedTabIndex);
      dispatch(setShownMessageCategoryAction(newCategory));
      setCategory(newCategory);
      // The same list instance renders both categories, so the scroll offset
      // would otherwise carry over from one category to the other
      listRef.current?.scrollToOffset({ animated: false, offset: 0 });
    },
    [category, dispatch]
  );

  return (
    <>
      <MessageList
        category={category}
        NavigationBar={
          <TabNavigationContainer
            currentCategory={category}
            onTabPressed={onTabNavigationItemPressed}
          />
        }
        ref={listRef}
      />
      <SectionStatusComponent sectionKey="messages" />
      <ArchiveRestoreBar />
    </>
  );
};
