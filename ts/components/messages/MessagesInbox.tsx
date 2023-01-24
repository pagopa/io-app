import * as O from "fp-ts/lib/Option";
import { View } from "native-base";
import React, { useCallback } from "react";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../i18n";
import { UIMessage } from "../../store/reducers/entities/messages/types";
import { UaDonationsBanner } from "../../features/uaDonations/components/UaDonationsBanner";
import { useItemsSelection } from "../../utils/hooks/useItemsSelection";
import ListSelectionBar from "../ListSelectionBar";
import {
  allInboxSelector,
  isLoadingInboxNextPage,
  isLoadingInboxPreviousPage,
  isReloadingInbox
} from "../../store/reducers/entities/messages/allPaginated";
import { IOStyles } from "../core/variables/IOStyles";
import { EmptyListComponent } from "./EmptyListComponent";
import PaginatedMessageList from "./PaginatedMessageList";
import { useMessagesFetcher } from "./hooks/useMessagesFetcher";

type Props = {
  navigateToMessageDetail: (message: UIMessage) => void;
  archiveMessages: (messages: ReadonlyArray<UIMessage>) => void;
};

/**
 * Container for the message inbox.
 *
 * @param navigateToMessageDetail
 * @param archiveMessages a function called when the user taps on the archive CTA
 * @constructor
 */
const MessagesInbox = ({ navigateToMessageDetail, archiveMessages }: Props) => {
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
    false,
    allInboxSelector,
    isLoadingInboxNextPage,
    isLoadingInboxPreviousPage,
    isReloadingInbox
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
    [navigateToMessageDetail, selectedItems, toggleItem]
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
        <PaginatedMessageList
          testID="MessageList_inbox"
          messages={messages}
          isSome={isSome}
          isError={isError}
          isRefreshing={isRefreshing}
          isLoading={isLoading}
          nextCursor={nextCursor}
          previousCursor={previousCursor}
          refresh={refresh}
          fetchNextPage={fetchNextPage}
          fetchPreviousPage={fetchPreviousPage}
          onPressItem={onPressItem}
          onLongPressItem={onLongPressItem}
          selectedMessageIds={O.toUndefined(selectedItems)}
          ListEmptyComponent={ListEmptyComponent}
          ListHeaderComponent={<UaDonationsBanner />}
        />
      </View>
      {isSelecting && (
        <ListSelectionBar
          selectedItems={selectedItemsCount}
          totalItems={allItemsCount}
          onToggleSelection={() => {
            archiveMessages(
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
          primaryButtonText={I18n.t("messages.cta.archive")}
        />
      )}
    </View>
  );
};

export default MessagesInbox;
