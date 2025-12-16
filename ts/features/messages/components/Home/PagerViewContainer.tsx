import { pipe } from "fp-ts/lib/function";
import { forwardRef, useCallback, useRef } from "react";
import { FlatList, NativeSyntheticEvent } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import PagerView from "react-native-pager-view";
import { OnPageSelectedEventData } from "react-native-pager-view/lib/typescript/specs/PagerViewNativeComponent";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { setShownMessageCategoryAction } from "../../store/actions";
import { GlobalState } from "../../../../store/reducers/types";
import { useTabItemPressWhenScreenActive } from "../../../../hooks/useTabItemPressWhenScreenActive";
import {
  messageCountForCategorySelector,
  shownMessageCategorySelector
} from "../../store/reducers/allPaginated";
import { foldK as foldMessageListCategory } from "../../types/messageListCategory";
import SectionStatusComponent from "../../../../components/SectionStatus";
import { trackAutoRefresh, trackMessagesPage } from "../../analytics";
import { pageSize } from "../../../../config";
import { MessageList } from "./MessageList";
import {
  getInitialReloadAllMessagesActionIfNeeded,
  getLoadPreviousPageMessagesActionIfAllowed,
  getMessagesViewPagerInitialPageIndex,
  messageViewPageIndexToListCategory,
  trackMessagePageOnFocusEventIfAllowed
} from "./homeUtils";
import { ArchiveRestoreBar } from "./ArchiveRestoreBar";

export const PagerViewContainer = forwardRef<PagerView>((_, ref) => {
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
      const shownCategory = shownMessageCategorySelector(state);
      trackAutoRefresh(shownCategory);
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
      // Be aware that this callback is triggered:
      // - upon first PagerView rendering;
      // - when the user completes a full horizontal swipe;
      // - when the TabNavigationContainer uses the PagerView's ref to switch page.

      // Also note that this method is called only on an effective page
      // change so if there is none (i.e., the user swipe is not wide
      // enough to move to a new page and the pager view scrolls back
      // to the current displayed page), this callback is not invoked,
      // thus allowing us not to check for a changed category/page-index.

      const selectedTabIndex = selectionEvent.nativeEvent.position;
      const selectedShownCategory =
        messageViewPageIndexToListCategory(selectedTabIndex);
      dispatch(setShownMessageCategoryAction(selectedShownCategory));

      // Be aware that the store.state must not be extracted outside of
      // this useEffect hook, otherwise it will re-run the callback on
      // every state change.
      const state = store.getState();

      // Make sure that the above call to
      // 'setShownMessageCategoryAction(selectedShownCategory)'
      // has been done before all the following code below, otherwise
      // the store will not have the proper 'shownCategory' value

      // Track message category change
      const messageCount = messageCountForCategorySelector(
        state,
        selectedShownCategory
      );
      trackMessagesPage(selectedShownCategory, messageCount, pageSize, true);

      // Handle inizial message loading (if needed)
      dispatchReloadAllMessagesIfNeeded(state);

      // The following onvoked method has an internal logic by
      // which it does not dispatch anything if the previous
      // `dispatchReloadAllMessagesIfNeeded` has already requested
      // a 'reloadAllMessages.request'. It is called here to refresh
      // the message list when not changing the screen but only
      // switching between tabs.
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

  return (
    <>
      <PagerView
        initialPage={initialPageIndex}
        onPageSelected={onPagerViewPageSelected}
        ref={ref}
        style={{ flex: 1 }}
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
