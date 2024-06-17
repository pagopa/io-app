import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Divider } from "@pagopa/io-app-design-system";
import {
  useSafeAreaFrame,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import I18n from "../../../../i18n";
import { MessageListCategory } from "../../types/messageListCategory";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { messageListForCategorySelector } from "../../store/reducers/allPaginated";
import { UIMessage } from "../../types";
import {
  getLoadNextPageMessagesActionIfAllowed,
  messageListItemHeight
} from "./homeUtils";
import { WrappedMessageListItem } from "./WrappedMessageListItem";
import { MessageListItemSkeleton } from "./DS/MessageListItemSkeleton";
import { EmptyList } from "./EmptyList";
import { Footer } from "./Footer";
import { CustomRefreshControl } from "./CustomRefreshControl";

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

export const MessageList = ({ category }: MessageListProps) => {
  const store = useIOStore();
  const dispatch = useIODispatch();
  const safeAreaFrame = useSafeAreaFrame();
  const safeAreaInsets = useSafeAreaInsets();

  const messageList = useIOSelector(state =>
    messageListForCategorySelector(state, category)
  );
  const loadingList = useMemo(() => {
    const listHeight =
      safeAreaFrame.height -
      safeAreaInsets.top -
      safeAreaInsets.bottom -
      topBarHeight -
      bottomTabHeight;
    const count = Math.floor(listHeight / messageListItemHeight());
    return [...Array(count).keys()];
  }, [safeAreaFrame.height, safeAreaInsets.top, safeAreaInsets.bottom]);

  const onEndReachedCallback = useCallback(
    ({ distanceFromEnd }: { distanceFromEnd: number }) => {
      const state = store.getState();
      const loadNextPageMessages = getLoadNextPageMessagesActionIfAllowed(
        state,
        category,
        distanceFromEnd
      );
      if (loadNextPageMessages) {
        dispatch(loadNextPageMessages);
      }
    },
    [category, dispatch, store]
  );

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={(messageList ?? loadingList) as Readonly<Array<number | UIMessage>>}
      ListEmptyComponent={<EmptyList category={category} />}
      ItemSeparatorComponent={messageList ? () => <Divider /> : undefined}
      renderItem={({ index, item }) => {
        if (typeof item === "number") {
          return (
            <MessageListItemSkeleton
              accessibilityLabel={I18n.t("messages.loading")}
            />
          );
        } else {
          return <WrappedMessageListItem index={index} message={item} />;
        }
      }}
      ListFooterComponent={<Footer category={category} />}
      refreshControl={<CustomRefreshControl category={category} />}
      onEndReached={onEndReachedCallback}
      onEndReachedThreshold={0.1}
      testID={`message_list_${category.toLowerCase()}`}
    />
  );
};
