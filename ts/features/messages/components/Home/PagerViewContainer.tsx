import React, { useCallback, useEffect, useRef } from "react";
import { pipe } from "fp-ts/lib/function";
import { FlatList, NativeSyntheticEvent } from "react-native";
import PagerView from "react-native-pager-view";
import { OnPageSelectedEventData } from "react-native-pager-view/lib/typescript/PagerViewNativeComponent";
import { IOStyles } from "@pagopa/io-app-design-system";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { setShownMessageCategoryAction } from "../../store/actions";
import { GlobalState } from "../../../../store/reducers/types";
import { useTabItemPressWhenScreenActive } from "../../../../hooks/useTabItemPressWhenScreenActive";
import { shownMessageCategorySelector } from "../../store/reducers/allPaginated";
import { foldK as foldMessageListCategory } from "../../types/messageListCategory";
import { MessageList } from "./MessageList";
import {
  getInitialReloadAllMessagesActionIfNeeded,
  getMessagesViewPagerInitialPageIndex,
  messageViewPageIndexToListCategory
} from "./homeUtils";
import { ArchiveRestoreBar } from "./ArchiveRestoreBar";

export const PagerViewContainer = React.forwardRef<PagerView>((_, ref) => {
  console.log(`=== PagerViewContainer`);
  const dispatch = useIODispatch();
  const store = useIOStore();
  const archiveFlatListRef = useRef<FlatList>(null);
  const inboxFlatListRef = useRef<FlatList>(null);

  const initialPageIndex = getMessagesViewPagerInitialPageIndex(
    store.getState()
  );

  const onTabPressedCallback = useCallback(
    () =>
      pipe(
        store.getState(),
        shownMessageCategorySelector,
        foldMessageListCategory(
          () => inboxFlatListRef,
          () => archiveFlatListRef
        ),
        flatListRef =>
          flatListRef.current?.scrollToOffset({ animated: true, offset: 0 })
      ),
    [store]
  );
  const dispatchReloadAllMessagesIfNeeded = useCallback(
    (state: GlobalState) => {
      const reloadAllMessagesActionOrUndefined =
        getInitialReloadAllMessagesActionIfNeeded(state);
      if (reloadAllMessagesActionOrUndefined) {
        dispatch(reloadAllMessagesActionOrUndefined);
      }
    },
    [dispatch]
  );
  const onPagerViewPageSelected = useCallback(
    (selectionEvent: NativeSyntheticEvent<OnPageSelectedEventData>) => {
      // Be aware that this callback is triggered when the user swipes
      // horizontally but also when the TabNavigationContainer uses the
      // PagerView's ref to switch page

      // Also note that this method is called only on an effective page
      // change so if there is none (i.e., the user swipe is not wide
      // enough to move to a new page and the pager view scrolls back
      // to the current displayed page), this callback is not invoked,
      // thus allowing us not to check for a changed category/page-index

      const selectedTabIndex = selectionEvent.nativeEvent.position;
      const selectedShownCategory =
        messageViewPageIndexToListCategory(selectedTabIndex);
      dispatch(setShownMessageCategoryAction(selectedShownCategory));

      // Be aware that the store.state must not be extracted outside of
      // this useEffect hook, otherwise it will re-run the hook every
      // time the state changes. Be also aware that
      // 'setShownMessageCategoryAction(selectedShownCategory)' above
      // must be called before 'reloadAllMessage.request' below, otherwise
      // the store will not have the proper 'shownCategory' value
      const state = store.getState();
      dispatchReloadAllMessagesIfNeeded(state);
    },
    [dispatch, dispatchReloadAllMessagesIfNeeded, store]
  );
  useTabItemPressWhenScreenActive(onTabPressedCallback, false);
  useEffect(() => {
    // Upon first component rendering, the PagerView's onPageSelected
    // callback is not called, so we must dispatch the reload action
    // for the initial shown message list
    const state = store.getState();
    dispatchReloadAllMessagesIfNeeded(state);
  }, [dispatchReloadAllMessagesIfNeeded, store]);

  return (
    <>
      <PagerView
        initialPage={initialPageIndex}
        onPageSelected={onPagerViewPageSelected}
        ref={ref}
        style={IOStyles.flex}
      >
        <MessageList
          category={"INBOX"}
          key={`message_list_inbox`}
          ref={inboxFlatListRef}
        />
        <MessageList
          category={"ARCHIVE"}
          key={`message_list_category`}
          ref={archiveFlatListRef}
        />
      </PagerView>
      <ArchiveRestoreBar />
    </>
  );
});
