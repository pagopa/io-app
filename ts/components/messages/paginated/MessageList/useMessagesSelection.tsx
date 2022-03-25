import React from "react";
import { useItemsSelection } from "../../../../utils/hooks/useItemsSelection";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import ListSelectionBar from "../../../ListSelectionBar";

export const useMessagesSelection = (
  allMessagesIDs: Array<string>,
  navigateToMessageDetail: (message: UIMessage) => void,
  primaryActionText: string,
  primaryAction: (selectedItems: ReadonlySet<string>) => void
) => {
  const { selectedItems, toggleItem, setAllItems, resetSelection } =
    useItemsSelection();

  const isSelecting = selectedItems.isSome();
  const selectedItemsCount = selectedItems.toUndefined()?.size ?? 0;
  const allItemsCount = allMessagesIDs.length;

  const onPressItem = (message: UIMessage) => {
    if (selectedItems.isSome()) {
      toggleItem(message.id);
    } else {
      navigateToMessageDetail(message);
    }
  };

  const onLongPressItem = (id: string) => {
    toggleItem(id);
  };

  const onToggleAllSelection = () => {
    if (selectedItemsCount === allItemsCount) {
      setAllItems([]);
    } else {
      setAllItems(allMessagesIDs);
    }
  };

  const MessageSelectionBar = () =>
    isSelecting ? (
      <ListSelectionBar
        selectedItems={selectedItemsCount}
        totalItems={allItemsCount}
        onToggleSelection={() => {
          primaryAction(selectedItems.getOrElse(new Set()));
          resetSelection();
        }}
        onToggleAllSelection={onToggleAllSelection}
        onResetSelection={resetSelection}
        primaryButtonText={primaryActionText}
      />
    ) : null;

  return {
    selectedItems,
    onPressItem,
    onLongPressItem,
    MessageSelectionBar
  };
};
