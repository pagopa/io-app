import { pipe } from "fp-ts/lib/function";
import React, { useCallback, useEffect, useRef } from "react";
import { FlatList, NativeSyntheticEvent } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import PagerView from "react-native-pager-view";
import { OnPageSelectedEventData } from "react-native-pager-view/lib/typescript/PagerViewNativeComponent";
import { IOStyles } from "@pagopa/io-app-design-system";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { setShownMessageCategoryAction } from "../../store/actions";
import { GlobalState } from "../../../../store/reducers/types";
import { useTabItemPressWhenScreenActive } from "../../../../hooks/useTabItemPressWhenScreenActive";
import { shownMessageCategorySelector } from "../../store/reducers/allPaginated";
import { foldK as foldMessageListCategory } from "../../types/messageListCategory";
import SectionStatusComponent from "../../../../components/SectionStatus";
import { MessageList } from "./MessageList";
import {
  getInitialReloadAllMessagesActionIfNeeded,
  getLoadPreviousPageMessagesActionIfAllowed,
  getMessagesViewPagerInitialPageIndex,
  messageViewPageIndexToListCategory
} from "./homeUtils";
import { ArchiveRestoreBar } from "./ArchiveRestoreBar";

export const PagerViewContainer = React.forwardRef<PagerView>((_, ref) => {
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
  const loadNewlyReceivedMessagesIfNeededCallback = useCallback(() => {
    const state = store.getState();
    const loadPreviousPageAction =
      getLoadPreviousPageMessagesActionIfAllowed(state);
    if (loadPreviousPageAction) {
      dispatch(loadPreviousPageAction);
    }
  }, [dispatch, store]);
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

      // As before, in order for the following call to work propertly,
      // 'setShownMessageCategoryAction(selectedShownCategory)' has to be
      // called before it (otherwise the 'shownMessageCategory' will be
      // wrong). It has an internal logic by which it does not dispatch
      // anything if the previous `dispatchReloadAllMessagesIfNeeded` has
      // already requested a 'reloadAllMessages.request'
      // It is called here to refresh the message list when not changing
      // the screen but only switching between tabs
      loadNewlyReceivedMessagesIfNeededCallback();
    },
    [
      dispatch,
      dispatchReloadAllMessagesIfNeeded,
      loadNewlyReceivedMessagesIfNeededCallback,
      store
    ]
  );
  useTabItemPressWhenScreenActive(onTabPressedCallback, false);
  useFocusEffect(
    useCallback(() => {
      // This is called to automatically refresh after coming back
      // to this screen from another one. The timeout is needed to avoid
      // a glitch with the FlatList that does not update the pull-to-refresh
      // margins after the check has completed (what happens is that the
      // pull-to-refresh control disappears but the list keeps its blank
      // view placeholder visible)
      setTimeout(() => {
        loadNewlyReceivedMessagesIfNeededCallback();
      }, 100);
    }, [loadNewlyReceivedMessagesIfNeededCallback])
  );
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
      <SectionStatusComponent sectionKey="messages" />
      <ArchiveRestoreBar />
    </>
  );
});
