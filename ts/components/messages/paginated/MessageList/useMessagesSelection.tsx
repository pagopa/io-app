import React from "react";
import { useItemsSelection } from "../../../../utils/hooks/useItemsSelection";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import ListSelectionBar from "../../../ListSelectionBar";

export const useMessagesSelection = (
  allMessages: ReadonlyArray<UIMessage>,
  navigateToMessageDetail: (message: UIMessage) => void,
  primaryActionText: string,
  primaryAction: (selectedItems: ReadonlyArray<UIMessage>) => void
) => {
  const { selectedItems, toggleItem, setAllItems, resetSelection } =
    useItemsSelection();

  const isSelecting = selectedItems.isSome();
  const selectedItemsCount = selectedItems.toUndefined()?.size ?? 0;
  const allItemsCount = allMessages.length;

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
      setAllItems(allMessages.map(_ => _.id));
    }
  };

  const MessagesSelectionBar = () =>
    isSelecting ? (
      <ListSelectionBar
        selectedItems={selectedItemsCount}
        totalItems={allItemsCount}
        onToggleSelection={() => {
          primaryAction(
            allMessages.filter(_ =>
              selectedItems.getOrElse(new Set()).has(_.id)
            )
          );
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
    MessagesSelectionBar
  };
};
