import { Divider, IOColors } from "@pagopa/io-app-design-system";
import React, { useCallback, useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import {
  useSafeAreaFrame,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import I18n from "../../../../i18n";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { LandingScreenBannerPicker } from "../../../landingScreenMultiBanner/components/LandingScreenBannerPicker";
import { trackPullToRefresh } from "../../analytics";
import {
  messageListForCategorySelector,
  shouldShowRefreshControllOnListSelector
} from "../../store/reducers/allPaginated";
import { UIMessage } from "../../types";
import { MessageListCategory } from "../../types/messageListCategory";
import {
  MessageListItemSkeleton,
  SkeletonHeight
} from "./DS/MessageListItemSkeleton";
import { EmptyList } from "./EmptyList";
import { Footer } from "./Footer";
import {
  generateMessageListLayoutInfo,
  getLoadNextPageMessagesActionIfAllowed,
  getReloadAllMessagesActionForRefreshIfAllowed,
  LayoutInfo,
  trackMessageListEndReachedIfAllowed
} from "./homeUtils";
import { WrappedMessageListItem } from "./WrappedMessageListItem";

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1
  }
});

type MessageListProps = {
  category: MessageListCategory;
};

const topBarHeight = 108;
const bottomTabHeight = 54;

export const MessageList = React.forwardRef<FlatList, MessageListProps>(
  ({ category }: MessageListProps, ref) => {
    const store = useIOStore();
    const dispatch = useIODispatch();
    const safeAreaFrame = useSafeAreaFrame();
    const safeAreaInsets = useSafeAreaInsets();

    const messageList = useIOSelector(state =>
      messageListForCategorySelector(state, category)
    );
    const isRefreshing = useIOSelector(state =>
      shouldShowRefreshControllOnListSelector(state, category)
    );
    const loadingList = useMemo(() => {
      const listHeight =
        safeAreaFrame.height -
        safeAreaInsets.top -
        safeAreaInsets.bottom -
        topBarHeight -
        bottomTabHeight;
      const count = Math.floor(listHeight / SkeletonHeight);
      return [...Array(count).keys()];
    }, [safeAreaFrame.height, safeAreaInsets.top, safeAreaInsets.bottom]);

    const layoutInfo: ReadonlyArray<LayoutInfo> = useMemo(
      () =>
        generateMessageListLayoutInfo(
          loadingList,
          messageList,
          store.getState()
        ),
      [loadingList, messageList, store]
    );
    const getItemLayoutCallback = useCallback(
      (_: ArrayLike<UIMessage | number> | null | undefined, index: number) =>
        layoutInfo[index],
      [layoutInfo]
    );

    const onRefreshCallback = useCallback(() => {
      trackPullToRefresh(category);
      const state = store.getState();
      const reloadAllMessagesAction =
        getReloadAllMessagesActionForRefreshIfAllowed(state, category);
      if (reloadAllMessagesAction) {
        dispatch(reloadAllMessagesAction);
      }
    }, [category, dispatch, store]);
    const onEndReachedCallback = useCallback(() => {
      const state = store.getState();
      const loadNextPageMessages = getLoadNextPageMessagesActionIfAllowed(
        state,
        category,
        new Date()
      );
      trackMessageListEndReachedIfAllowed(
        category,
        !!loadNextPageMessages,
        state
      );
      if (loadNextPageMessages) {
        dispatch(loadNextPageMessages);
      }
    }, [category, dispatch, store]);
    return (
      <FlatList
        ref={ref}
        contentContainerStyle={styles.contentContainer}
        data={
          (messageList ?? loadingList) as Readonly<Array<number | UIMessage>>
        }
        ListEmptyComponent={<EmptyList category={category} />}
        ItemSeparatorComponent={messageList ? () => <Divider /> : undefined}
        ListHeaderComponent={
          category === "INBOX" ? <LandingScreenBannerPicker /> : undefined
        }
        getItemLayout={getItemLayoutCallback}
        renderItem={({ index, item }) => {
          if (typeof item === "number") {
            return (
              <MessageListItemSkeleton
                accessibilityLabel={I18n.t("messages.loading")}
              />
            );
          } else {
            return (
              <WrappedMessageListItem
                index={index}
                message={item}
                source={category}
              />
            );
          }
        }}
        ListFooterComponent={<Footer category={category} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefreshCallback}
            tintColor={IOColors["blueIO-500"]}
            colors={[IOColors["blueIO-500"]]}
            testID={`custom_refresh_control_${category.toLowerCase()}`}
          />
        }
        onEndReached={onEndReachedCallback}
        onEndReachedThreshold={0.1}
        testID={`message_list_${category.toLowerCase()}`}
      />
    );
  }
);
