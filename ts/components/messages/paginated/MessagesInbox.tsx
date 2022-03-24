import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import { none } from "fp-ts/lib/Option";
import { UIMessage } from "../../../store/reducers/entities/messages/types";
import I18n from "../../../i18n";
import { EmptyListComponent } from "../EmptyListComponent";

import { useItemsSelection } from "../../../utils/hooks/useItemsSelection";
import ListSelectionBar from "../../ListSelectionBar";
import MessageList from "./MessageList";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },
  listContainer: {
    flex: 1
  }
});

type Props = {
  allMessagesIDs: Array<string>;
  navigateToMessageDetail: (message: UIMessage) => void;
};

/**
 * Container for the message inbox.
 * It looks redundant at the moment but will be used later on once we bring back
 * states and filtering in the Messages.
 *
 * @param allMessagesIDs used for handling messages selection
 * @param navigateToMessageDetail
 * @constructor
 */
const MessagesInbox = ({ allMessagesIDs, navigateToMessageDetail }: Props) => {
  const { selectedItems, toggleItem, setAllItems, resetSelection } =
    useItemsSelection();

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

  const ListEmptyComponent = () => (
    <EmptyListComponent
      image={require("../../../../img/messages/empty-message-list-icon.png")}
      title={I18n.t("messages.inbox.emptyMessage.title")}
      subtitle={I18n.t("messages.inbox.emptyMessage.subtitle")}
    />
  );

  return (
    <View style={styles.listWrapper}>
      <View style={styles.listContainer}>
        <MessageList
          filter={{ getArchived: false }}
          onPressItem={onPressItem}
          onLongPressItem={onLongPressItem}
          selectedMessageIds={selectedItems.toUndefined()}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
      {selectedItems !== none && (
        <ListSelectionBar
          selectedItems={selectedItemsCount}
          totalItems={allItemsCount}
          onToggleSelection={() => undefined}
          onToggleAllSelection={onToggleAllSelection}
          onResetSelection={resetSelection}
          primaryButtonText={I18n.t("messages.cta.archive")}
        />
      )}
    </View>
  );
};

export default MessagesInbox;
