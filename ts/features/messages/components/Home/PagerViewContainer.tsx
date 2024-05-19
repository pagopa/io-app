import React, { useCallback } from "react";
import { NativeSyntheticEvent } from "react-native";
import PagerView from "react-native-pager-view";
import { OnPageSelectedEventData } from "react-native-pager-view/lib/typescript/PagerViewNativeComponent";
import { IOStyles } from "@pagopa/io-app-design-system";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { setShownMessageCategoryAction } from "../../store/actions";
import { MessageList } from "./MessageList";
import {
  getMessagesViewPagerInitialPageIndex,
  messageViewPageIndexToListCategory
} from "./homeUtils";

export const PagerViewContainer = React.forwardRef<PagerView>((_, ref) => {
  // console.log(`=== PagerViewContainer`);
  const dispatch = useIODispatch();
  const store = useIOStore();
  const state = store.getState();
  const initialPageIndex = getMessagesViewPagerInitialPageIndex(state);
  const onPagerViewPageSelected = useCallback(
    (selectionEvent: NativeSyntheticEvent<OnPageSelectedEventData>) => {
      const selectedTabIndex = selectionEvent.nativeEvent.position;
      const selectedShownCategory =
        messageViewPageIndexToListCategory(selectedTabIndex);
      dispatch(setShownMessageCategoryAction(selectedShownCategory));
    },
    [dispatch]
  );
  return (
    <PagerView
      initialPage={initialPageIndex}
      onPageSelected={onPagerViewPageSelected}
      ref={ref}
      style={IOStyles.flex}
    >
      <MessageList key={`message_list_inbox`} category={"INBOX"} />
      <MessageList key={`message_list_category`} category={"ARCHIVE"} />
    </PagerView>
  );
});
