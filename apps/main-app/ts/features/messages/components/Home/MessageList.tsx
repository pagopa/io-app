import { Divider } from "@io-app/design-system";
import { FlashList, FlashListRef, ListRenderItem } from "@shopify/flash-list";
import I18n from "i18next";
import { forwardRef, useCallback, useMemo } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import {
  useSafeAreaFrame,
  useSafeAreaInsets
} from "react-native-safe-area-context";

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
  ListItemMessageSkeleton,
  SkeletonHeight
} from "./DS/ListItemMessageSkeleton";
import { EmptyList } from "./EmptyList";
import { Footer } from "./Footer";
import {
  getLoadNextPageMessagesActionIfAllowed,
  getReloadAllMessagesActionForRefreshIfAllowed,
  trackMessageListEndReachedIfAllowed
} from "./homeUtils";
import { WrappedListItemMessage } from "./WrappedListItemMessage";

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1
  }
});
type MessageListProps = {
  category: MessageListCategory;
  NavigationBar: React.ReactNode;
};

const topBarHeight = 108;
const bottomTabHeight = 54;

export type MessageListItem = number | UIMessage;

/**
 * Skeleton rows and message rows have different layouts, so they are kept in
 * separate recycling pools to avoid reusing a cell of the wrong shape.
 */
const getItemType = (item: MessageListItem) =>
  typeof item === "number" ? "skeleton" : "message";

const keyExtractor = (item: MessageListItem) =>
  typeof item === "number" ? `${item}` : item.id;

const maintainVisibleContentPosition = { disabled: true };

export const MessageList = forwardRef<
  FlashListRef<MessageListItem>,
  MessageListProps
>(({ category, NavigationBar }, ref) => {
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
  const isLoading = messageList === undefined;

  const loadingList: ReadonlyArray<number> = useMemo(() => {
    const listHeight =
      safeAreaFrame.height -
      safeAreaInsets.top -
      safeAreaInsets.bottom -
      topBarHeight -
      bottomTabHeight;
    const count = Math.floor(listHeight / SkeletonHeight);
    return [...Array(count).keys()];
  }, [safeAreaFrame.height, safeAreaInsets.top, safeAreaInsets.bottom]);

  const data: ReadonlyArray<MessageListItem> = isLoading
    ? loadingList
    : messageList;

  const renderItem: ListRenderItem<MessageListItem> = useCallback(
    ({ item, index }) =>
      typeof item === "number" ? (
        <ListItemMessageSkeleton
          accessibilityLabel={I18n.t("messages.loading")}
        />
      ) : (
        <WrappedListItemMessage
          index={index}
          message={item}
          source={category}
        />
      ),
    [category]
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

  const ListHeader = useMemo(() => {
    const BannerPicker =
      category === "INBOX" ? <LandingScreenBannerPicker /> : null;
    return (
      <View>
        {NavigationBar}
        {BannerPicker}
      </View>
    );
  }, [NavigationBar, category]);

  return (
    <FlashList
      contentContainerStyle={styles.contentContainer}
      data={data}
      getItemType={getItemType}
      ItemSeparatorComponent={isLoading ? undefined : Divider}
      keyExtractor={keyExtractor}
      ListEmptyComponent={<EmptyList category={category} />}
      ListFooterComponent={<Footer category={category} />}
      ListHeaderComponent={ListHeader}
      // FlashList anchors the viewport by default, which would hide newly
      // received or freshly archived messages above the fold instead of
      // showing them at the top of the list
      maintainVisibleContentPosition={maintainVisibleContentPosition}
      onEndReached={onEndReachedCallback}
      onEndReachedThreshold={0.1}
      ref={ref}
      refreshControl={
        <RefreshControl
          onRefresh={onRefreshCallback}
          refreshing={isRefreshing}
          testID={`custom_refresh_control_${category.toLowerCase()}`}
        />
      }
      renderItem={renderItem}
      testID={`message_list_${category.toLowerCase()}`}
    />
  );
});
