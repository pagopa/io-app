import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Vibration
} from "react-native";
import { connect } from "react-redux";

import { maximumItemsFromAPI, pageSize } from "../../../../config";
import I18n from "../../../../i18n";
import {
  Filter,
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../../../store/actions/messages";
import { Dispatch } from "../../../../store/actions/types";
import {
  allArchiveSelector,
  allInboxSelector,
  Cursor,
  isLoadingArchiveNextPage,
  isLoadingArchivePreviousPage,
  isReloadingArchive,
  isLoadingInboxNextPage,
  isLoadingInboxPreviousPage,
  isReloadingInbox
} from "../../../../store/reducers/entities/messages/allPaginated";
import { MessageState } from "../../../../store/reducers/entities/messages/messagesById";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import { GlobalState } from "../../../../store/reducers/types";
import customVariables, {
  VIBRATION_LONG_PRESS_DURATION
} from "../../../../theme/variables";
import { showToast } from "../../../../utils/showToast";
import { EdgeBorderComponent } from "../../../screens/EdgeBorderComponent";
import { isNoticePaid } from "../../../../store/reducers/entities/payments";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  AnimatedFlatList,
  EmptyComponent,
  generateItemLayout,
  ITEM_HEIGHT,
  ItemSeparator,
  renderEmptyList,
  renderItem
} from "./helpers";

const styles = StyleSheet.create({
  itemLoadingContainer: {
    height: ITEM_HEIGHT,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding,
    flex: 1
  },
  itemLoadingHeaderWrapper: {
    flexDirection: "row",
    marginBottom: 4
  },
  itemLoadingHeaderCenter: {
    flex: 1,
    paddingRight: 55 // Includes right header space
  },
  itemLoadingContentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 42
  },
  itemLoadingContentCenter: {
    flex: 1,
    paddingRight: 32
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  activityIndicator: {
    padding: 12
  }
});

type OwnProps = {
  ListEmptyComponent?: EmptyComponent;
  ListHeaderComponent?: React.ReactElement;

  /** @deprecated This list is used instead of the messages from the store */
  filteredMessages?: ReadonlyArray<UIMessage>;

  onLongPressItem?: (id: string) => void;
  onPressItem?: (message: UIMessage) => void;

  /** An optional list of messages to mark as selected */
  selectedMessageIds?: ReadonlySet<string>;

  filter: Filter;
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

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

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
  ListEmptyComponent,
  ListHeaderComponent,
  filteredMessages,
  onLongPressItem,
  hasPaidBadge,

  onPressItem = (_: UIMessage) => undefined,
  selectedMessageIds,

  // extracted from the store
  allMessages,
  error,
  isLoadingMore,
  isLoadingPrevious,
  isReloadingAll,
  didLoad,
  loadNextPage,
  loadPreviousPage,
  nextCursor,
  previousCursor,
  reloadAll
}: Props) => {
  // when filteredMessage is defined, this component is used
  // in search, so loading data on demand should be prevented
  const shouldUseLoad = filteredMessages === undefined;
  const messages = filteredMessages ?? allMessages;

  const flatListRef: React.RefObject<FlatList> = useRef(null);

  const [longPressedItemIndex, setLongPressedItemIndex] =
    useState<Option<number>>(none);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoadingPrevious && !isReloadingAll) {
      setIsRefreshing(false);
    }
  }, [isLoadingPrevious, isReloadingAll]);

  useOnFirstRender(
    () => {
      reloadAll();
    },
    () => shouldUseLoad && !didLoad
  );

  useEffect(() => {
    if (error) {
      showToast(I18n.t("global.genericError"), "warning");
    }
  }, [error]);

  const scrollTo = (index: number, animated: boolean = false) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({ animated, index });
    }
  };

  const handleOnLayoutChange = () => {
    if (longPressedItemIndex.isSome()) {
      scrollTo(longPressedItemIndex.value, true);
      setLongPressedItemIndex(none);
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
      setLongPressedItemIndex(some(lastIndex));
    }
  };

  const onEndReached = () => {
    if (shouldUseLoad && nextCursor && !isLoadingMore) {
      loadNextPage(nextCursor);
    }
  };

  const refreshControl = shouldUseLoad ? (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={() => {
        if (isRefreshing) {
          return;
        }

        setIsRefreshing(true);

        if (messages.length === 0) {
          reloadAll();
        } else if (previousCursor !== undefined) {
          loadPreviousPage(previousCursor);
        }
      }}
    />
  ) : undefined;

  const renderListFooter = () => {
    if (isLoadingMore || (isReloadingAll && !didLoad)) {
      return <Loader />;
    }
    if (messages.length > 0 && !nextCursor) {
      return <EdgeBorderComponent />;
    }
    return null;
  };

  return (
    <>
      <AnimatedFlatList
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={renderEmptyList({
          error,
          EmptyComponent: didLoad ? ListEmptyComponent : null
        })}
        data={messages}
        initialNumToRender={pageSize}
        keyExtractor={(message: UIMessage): string => message.id}
        ref={flatListRef}
        refreshControl={refreshControl}
        refreshing={isRefreshing}
        renderItem={renderItem({
          hasPaidBadge,
          onLongPress,
          onPress: onPressItem,
          selectedMessageIds
        })}
        scrollEnabled={true}
        scrollEventThrottle={animated?.scrollEventThrottle}
        style={styles.padded}
        getItemLayout={(_: ReadonlyArray<MessageState> | null, index: number) =>
          generateItemLayout(messages.length)(index)
        }
        onScroll={(...args) => {
          animated.onScroll(...args);
        }}
        onLayout={handleOnLayoutChange}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderListFooter}
      />
    </>
  );
};

const mapStateToProps = (state: GlobalState, { filter }: OwnProps) => {
  const isArchive = filter.getArchived;
  const paginatedState = isArchive
    ? allArchiveSelector(state)
    : allInboxSelector(state);
  const error = pot.isError(paginatedState) ? paginatedState.error : undefined;
  const { allMessages, nextCursor, previousCursor } = pot.getOrElse(
    pot.map(paginatedState, ps => ({
      allMessages: ps.page,
      nextCursor: ps.next,
      previousCursor: ps.previous
    })),
    {
      allMessages: [],
      nextCursor: undefined,
      previousCursor: undefined
    }
  );
  const didLoad = pot.isSome(paginatedState);
  return {
    allMessages,
    error,
    hasPaidBadge: (category: UIMessage["category"]) =>
      isNoticePaid(state, category),
    isLoadingMore: isArchive
      ? isLoadingArchiveNextPage(state)
      : isLoadingInboxNextPage(state),
    isLoadingPrevious: isArchive
      ? isLoadingArchivePreviousPage(state)
      : isLoadingInboxPreviousPage(state),
    isReloadingAll: isArchive
      ? isReloadingArchive(state)
      : isReloadingInbox(state),
    didLoad,
    nextCursor,
    previousCursor
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { filter }: OwnProps) => ({
  /**
   * Perform a complete refresh of the page, discarding the existing state.
   */
  reloadAll: () => {
    dispatch(reloadAllMessages.request({ pageSize, filter }));
  },

  loadNextPage: (cursor: Cursor) => {
    dispatch(loadNextPageMessages.request({ pageSize, cursor, filter }));
  },

  /**
   * We load the maximum amount of messages because we don't actually support
   * true backwards pagination. Is just to refresh the data.
   */
  loadPreviousPage: (cursor: Cursor) => {
    dispatch(
      loadPreviousPageMessages.request({
        pageSize: maximumItemsFromAPI,
        cursor,
        filter
      })
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageList);
