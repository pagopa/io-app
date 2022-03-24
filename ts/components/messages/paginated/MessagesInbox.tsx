import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

import { UIMessage } from "../../../store/reducers/entities/messages/types";
import I18n from "../../../i18n";
import { EmptyListComponent } from "../EmptyListComponent";

import MessageList from "./MessageList";
import { useMessagesSelection } from "./MessageList/useMessagesSelection";

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
  const { selectedItems, onPressItem, onLongPressItem, MessageSelectionBar } =
    useMessagesSelection(
      allMessagesIDs,
      navigateToMessageDetail,
      I18n.t("messages.cta.archive")
    );

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
      <MessageSelectionBar />
    </View>
  );
};

export default MessagesInbox;
