import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  StyleSheet,
  Vibration
} from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import { pageSize } from "../../../../config";
import { loadNextPageMessages } from "../../../../store/actions/messages";
import { navigateToMessageRouterScreen } from "../../../../store/actions/navigation";
import { Dispatch } from "../../../../store/actions/types";
import {
  allPaginatedMessagesSelector,
  Cursor,
  isLoadingNextPage,
  isLoadingPreviousPage
} from "../../../../store/reducers/entities/messages/allPaginated";
import { MessageState } from "../../../../store/reducers/entities/messages/messagesById";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";

import { GlobalState } from "../../../../store/reducers/types";
import customVariables, {
  VIBRATION_LONG_PRESS_DURATION
} from "../../../../theme/variables";

import { isIos } from "../../../../utils/platform";
import { EdgeBorderComponent } from "../../../screens/EdgeBorderComponent";
import { ErrorLoadingComponent } from "../../ErrorLoadingComponent";
import {
  AnimatedFlatList,
  generateItemLayout,
  ITEM_HEIGHT,
  ItemSeparator,
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
  ListEmptyComponent?: React.ComponentProps<
    typeof FlatList
  >["ListEmptyComponent"];

  /** This list is used instead of the messages from the store */
  filteredMessages?: ReadonlyArray<UIMessage>;

  onLongPressItem?: (id: string) => void;
  onPressItem?: (id: string) => void;

  /** An optional list of messages to mark as selected */
  selectedMessageIds?: ReadonlySet<string>;
};

export type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
};

type Props = OwnProps &
  AnimatedProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * A smart-component connected to the store and dispatching actions.
 * Takes care of mapping pagination to the pull/scroll semantics and track the loading and error states.
 *
 * By default renders all the available Messages in the store, but this behavior can be overruled
 * via the optional parameter `filteredMessages`.
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
  animated,
  filteredMessages,
  onLongPressItem,

  onPressItem = (_: string) => undefined,
  selectedMessageIds,

  // extracted from the store
  error,
  isLoadingMore,
  isRefreshing,
  loadNextPage,
  loadPreviousPage,
  allMessages,
  nextCursor,
  previousCursor
}: Props) => {
  const messages = filteredMessages ?? allMessages;

  const flatListRef: React.RefObject<FlatList> = useRef(null);

  const [longPressedItemIndex, setLongPressedItemIndex] =
    useState<Option<number>>(none);

  const [isFirstLoad, setIsFirstLoad] = useState(isIos);

  const onEndReached = () => {
    if (nextCursor && !isLoadingMore) {
      loadNextPage(nextCursor);
    }
  };

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

  const onLongPress = (id: string) => {
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

  const refreshControl = (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={() => {
        if (isRefreshing) {
          return;
        }
        if (isFirstLoad) {
          setIsFirstLoad(false);
        }
        if (previousCursor) {
          loadPreviousPage(previousCursor);
        }
      }}
    />
  );

  return (
    <>
      <NavigationEvents onWillFocus={() => scrollTo(0)} />
      {/* in iOS refresh indicator is shown only when user does pull to refresh on list
          so only for iOS devices the ActivityIndicator is shown in place of RefreshControl
          see https://stackoverflow.com/questions/50307314/react-native-flatlist-refreshing-not-showing-when-its-true-during-first-load
          see https://github.com/facebook/react-native/issues/15892
        */}
      {isRefreshing && isFirstLoad && (
        <ActivityIndicator animating={true} style={styles.activityIndicator} />
      )}

      <AnimatedFlatList
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={
          error !== undefined ? (
            <ErrorLoadingComponent />
          ) : (
            <ListEmptyComponent />
          )
        }
        data={messages}
        initialNumToRender={10}
        keyExtractor={(message: UIMessage): string => message.id}
        ref={flatListRef}
        refreshControl={refreshControl}
        refreshing={isRefreshing}
        renderItem={renderItem({
          isRead: false, // TODO: likely an information to be added on the BE
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
          if (animated) {
            animated.onScroll(...args);
          }
        }}
        onLayout={handleOnLayoutChange}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          messages.length > 0 && !nextCursor && <EdgeBorderComponent />
        }
      />
    </>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const paginatedState = allPaginatedMessagesSelector(state);
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

  return {
    allMessages,
    nextCursor,
    previousCursor,
    error,
    isLoadingMore: isLoadingNextPage(state),
    isRefreshing: isLoadingPreviousPage(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadNextPage: (cursor: Cursor) => {
    dispatch(loadNextPageMessages.request({ pageSize, cursor }));
  },
  loadPreviousPage: (cursor: Cursor) => {
    // We load the maximum amount of messages because we don't actually support
    // true backwards pagination. Is just to refresh the data.
    dispatch(loadNextPageMessages.request({ pageSize: 100, cursor }));
  },
  navigateToMessageDetail: (messageId: string) =>
    navigateToMessageRouterScreen({ messageId })
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageList);
