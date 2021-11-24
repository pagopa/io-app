import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import { UIMessage } from "../../../store/reducers/entities/messages/types";
import I18n from "../../../i18n";
import ListSelectionBar from "../../ListSelectionBar";
import { useItemsSelection } from "../../../utils/hooks/useItemsSelection";
import { EmptyListComponent } from "../EmptyListComponent";

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
  messages: ReadonlyArray<UIMessage>;
  navigateToMessageDetail: (message: UIMessage) => void;
  setMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => void;
};

const MessagesInbox = ({
  messages,
  navigateToMessageDetail,
  setMessagesArchivedState
}: Props) => {
  const { selectedItems, toggleItem, setAllItems, resetSelection } =
    useItemsSelection();

  const toggleAllMessagesSelection = () => {
    selectedItems.map(items =>
      setAllItems(messages.length === items.size ? [] : messages.map(_ => _.id))
    );
  };

  const archiveMessages = () => {
    resetSelection();
    const ids: Array<string> = selectedItems
      .map(_ => Array.from(_))
      .getOrElse([]);
    setMessagesArchivedState(ids, true);
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
          onPressItem={(message: UIMessage) => {
            if (selectedItems.isSome()) {
              // Is the selection mode is active a simple "press" must act as
              // a "longPress" (select the item).
              toggleItem(message.id);
            } else {
              navigateToMessageDetail(message);
            }
          }}
          onLongPressItem={toggleItem}
          selectedMessageIds={selectedItems.toUndefined()}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>

      {selectedItems.isSome() && (
        <ListSelectionBar
          onResetSelection={resetSelection}
          onToggleAllSelection={toggleAllMessagesSelection}
          onToggleSelection={archiveMessages}
          primaryButtonText={I18n.t("messages.cta.archive")}
          selectedItems={selectedItems.map(_ => _.size).getOrElse(0)}
          totalItems={messages.length}
        />
      )}
    </View>
  );
};

export default MessagesInbox;
