import * as O from "fp-ts/lib/Option";
import { View } from "native-base";
import React, { useCallback } from "react";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../i18n";
import { UIMessage } from "../../store/reducers/entities/messages/types";
import { useItemsSelection } from "../../utils/hooks/useItemsSelection";
import ListSelectionBar from "../ListSelectionBar";
import {
  allArchiveSelector,
  isLoadingArchiveNextPage,
  isLoadingArchivePreviousPage,
  isReloadingArchive
} from "../../store/reducers/entities/messages/allPaginated";
import { IOStyles } from "../core/variables/IOStyles";
import { EmptyListComponent } from "./EmptyListComponent";
import MessageList from "./MessageList";
import { useMessagesFetcher } from "./hooks/useMessagesFetcher";

type Props = {
  navigateToMessageDetail: (message: UIMessage) => void;
  unarchiveMessages: (messages: ReadonlyArray<UIMessage>) => void;
};

/**
 * Container for the message archive.
 *
 * @param navigateToMessageDetail
 * @param unarchiveMessages a function called when the user taps on the unarchive CTA
 * @constructor
 */
const MessagesArchive = ({
  navigateToMessageDetail,
  unarchiveMessages
}: Props) => {
  const {
    isSome,
    isError,
    messages,
    nextCursor,
    previousCursor,
    isLoading,
    isRefreshing,
    refresh,
    fetchNextPage,
    fetchPreviousPage
  } = useMessagesFetcher(
    true,
    allArchiveSelector,
    isLoadingArchiveNextPage,
    isLoadingArchivePreviousPage,
    isReloadingArchive
  );

  const { selectedItems, toggleItem, resetSelection } = useItemsSelection();

  const isSelecting = O.isSome(selectedItems);
  const selectedItemsCount = O.toUndefined(selectedItems)?.size ?? 0;
  const allItemsCount = messages.length;

  const onPressItem = useCallback(
    (message: UIMessage) => {
      if (O.isSome(selectedItems)) {
        toggleItem(message.id);
      } else {
        navigateToMessageDetail(message);
      }
    },
    [selectedItems]
  );

  const onLongPressItem = (id: string) => {
    toggleItem(id);
  };

  const ListEmptyComponent = () => (
    <EmptyListComponent
      picture="airBaloon"
      title={I18n.t("messages.inbox.emptyMessage.title")}
      subtitle={I18n.t("messages.inbox.emptyMessage.subtitle")}
    />
  );

  return (
    <View style={IOStyles.flex}>
      <View style={IOStyles.flex}>
        <MessageList
          variant="paginated"
          testID="MessageList_archive"
          messages={messages}
          isSome={isSome}
          isError={isError}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          nextCursor={nextCursor}
          previousCursor={previousCursor}
          refresh={refresh}
          fetchNextPage={fetchNextPage}
          fetchPreviousPage={fetchPreviousPage}
          onPressItem={onPressItem}
          onLongPressItem={onLongPressItem}
          selectedMessageIds={O.toUndefined(selectedItems)}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
      {isSelecting && (
        <ListSelectionBar
          selectedItems={selectedItemsCount}
          totalItems={allItemsCount}
          onToggleSelection={() => {
            unarchiveMessages(
              messages.filter(_ =>
                pipe(
                  selectedItems,
                  O.getOrElseW(() => new Set())
                ).has(_.id)
              )
            );
            resetSelection();
          }}
          onResetSelection={resetSelection}
          primaryButtonText={I18n.t("messages.cta.unarchive")}
        />
      )}
    </View>
  );
};

export default MessagesArchive;
