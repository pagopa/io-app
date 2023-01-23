import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as O from "fp-ts/lib/Option";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Vibration
} from "react-native";
import { pageSize } from "../../../config";
import I18n from "../../../i18n";
import { Cursor } from "../../../store/reducers/entities/messages/allPaginated";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import customVariables, {
  VIBRATION_LONG_PRESS_DURATION
} from "../../../theme/variables";
import { useActionOnFocus } from "../../../utils/hooks/useOnFocus";
import { EdgeBorderComponent } from "../../screens/EdgeBorderComponent";
import {
  EmptyComponent,
  generateItemLayout,
  ItemSeparator,
  renderEmptyList,
  RenderItem
} from "./helpers";

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  activityIndicator: {
    padding: 12
  }
});

type Props = {
  variant: "paginated" | "not-paginated";
  messages: ReadonlyArray<UIMessage>;
  nextCursor?: string;
  previousCursor?: string;
  ListEmptyComponent?: EmptyComponent;
  ListHeaderComponent?: React.ReactElement;
  onLongPressItem?: (id: string) => void;
  onPressItem?: (message: UIMessage) => void;
  /** An optional list of messages to mark as selected */
  selectedMessageIds?: ReadonlySet<string>;
  refresh?: () => void;
  fetchNextPage?: () => void;
  fetchPreviousPage?: (cursor: Cursor) => void;
  testID?: string;
  isSome?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isRefreshing?: boolean;
};

const Loader = () => (
  <ActivityIndicator
    animating={true}
    size={"large"}
    style={styles.activityIndicator}
    color={customVariables.brandPrimary}
    accessible={true}
    accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
    accessibilityLabel={I18n.t("global.accessibility.activityIndicator.label")}
    importantForAccessibility={"no-hide-descendants"}
    testID={"activityIndicator"}
  />
);

const animated = {
  onScroll: Animated.event([
    {
      nativeEvent: {
        contentOffset: { y: new Animated.Value(0) }
      }
    }
  ]),
  scrollEventThrottle: 8
};

// Do not refresh again automatically before minimumRefreshInterval has passed
const minimumRefreshInterval = 60000 as Millisecond; // 1 minute

/**
 * A smart-component connected to the store and dispatching actions.
 * Takes care of mapping pagination to the pull/scroll semantics and track the loading and error states.
 *
 * By default renders all the available Messages in the store, but this behavior can be overruled
 * via the optional parameter `filteredMessages`.
 * Please note that once we filter on the BE the `filteredMessages` parameter will be removed.
 *
 * @param ListEmptyComponent
 * @param animated
 * @param filteredMessages This list is used instead of the messages from the store
 * @param onLongPressItem
 * @param onPressItem
 * @param selectedMessageIds An optional list of messages to mark as selected
 * @constructor
 */
const MessageList = ({
  variant,
  ListEmptyComponent,
  ListHeaderComponent,
  onLongPressItem,
  onPressItem = (_: UIMessage) => undefined,
  selectedMessageIds,
  messages,
  isSome,
  isError,
  isLoading,
  isRefreshing = false,
  refresh,
  fetchNextPage,
  fetchPreviousPage,
  previousCursor,
  testID
}: Props) => {
  const [isRefreshFromUser, setIsRefreshFromUser] = useState(false);
  // when variant is not-paginated, this component is used
  // in search, so loading data on demand should be prevented
  const shouldUseLoad = variant === "paginated";

  const flatListRef: React.RefObject<FlatList> = useRef(null);

  const [longPressedItemIndex, setLongPressedItemIndex] = useState<
    O.Option<number>
  >(O.none);

  useActionOnFocus(() => {
    // check if there are new messages when the component becomes focused
    if (previousCursor) {
      fetchPreviousPage?.(previousCursor);
    }
  }, minimumRefreshInterval);

  useEffect(() => {
    if (!isRefreshing /* && isRefreshFromUser */) {
      setIsRefreshFromUser(false);
    }
  }, [isRefreshing]);

  const scrollTo = (index: number, animated: boolean = false) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({ animated, index });
    }
  };

  const handleOnLayoutChange = () => {
    if (O.isSome(longPressedItemIndex)) {
      scrollTo(longPressedItemIndex.value, true);
      setLongPressedItemIndex(O.none);
    }
  };

  const onLongPress = ({ id }: UIMessage) => {
    if (!onLongPressItem) {
      return;
    }
    Vibration.vibrate(VIBRATION_LONG_PRESS_DURATION);
    onLongPressItem(id);
    const lastIndex = messages.length - 1;
    const lastMessageId = messages[lastIndex].id;
    if (id === lastMessageId) {
      setLongPressedItemIndex(O.some(lastIndex));
    }
  };

  const refreshControl = (
    <RefreshControl
      refreshing={isRefreshFromUser || isRefreshing}
      onRefresh={() => {
        setIsRefreshFromUser(true);
        refresh?.();
      }}
    />
  );

  const renderListFooter = () => {
    if (isLoading && !isRefreshFromUser) {
      return <Loader />;
    }
    return <EdgeBorderComponent />;
  };

  return (
    <Animated.FlatList
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={renderEmptyList({
        isError,
        EmptyComponent: isSome ? ListEmptyComponent : null
      })}
      data={messages}
      initialNumToRender={pageSize}
      keyExtractor={(message: UIMessage): string => message.id}
      ref={flatListRef}
      refreshControl={shouldUseLoad ? refreshControl : undefined}
      renderItem={({ item }: ListRenderItemInfo<UIMessage>) => (
        <RenderItem
          message={item}
          onLongPress={onLongPress}
          onPress={onPressItem}
          selectedMessageIds={selectedMessageIds}
        />
      )}
      scrollEnabled={true}
      scrollEventThrottle={animated?.scrollEventThrottle}
      style={styles.padded}
      getItemLayout={(
        _: ReadonlyArray<UIMessage> | null | undefined,
        index: number
      ) => generateItemLayout(messages.length)(index)}
      onScroll={(...args) => {
        animated.onScroll(...args);
      }}
      onLayout={handleOnLayoutChange}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.25}
      testID={testID}
      ListFooterComponent={renderListFooter}
    />
  );
};

export default MessageList;
