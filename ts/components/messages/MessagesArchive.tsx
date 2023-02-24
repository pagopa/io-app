import * as O from "fp-ts/lib/Option";
import { View } from "native-base";
import React, { useCallback } from "react";
import { StyleSheet } from "react-native";

import { pipe } from "fp-ts/lib/function";
import I18n from "../../i18n";
import { UIMessage } from "../../store/reducers/entities/messages/types";

import { useItemsSelection } from "../../utils/hooks/useItemsSelection";
import ListSelectionBar from "../ListSelectionBar";
import { IOStyles } from "../core/variables/IOStyles";
import { EmptyListComponent } from "./EmptyListComponent";
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
  unarchiveMessages: (messages: ReadonlyArray<UIMessage>) => void;
};

/**
 * Container for the message archive.
 * It looks redundant at the moment but will be used later on once we bring back
 * states and filtering in the Messages.
 *
 * @param messages used for handling messages selection
 * @param navigateToMessageDetail
 * @param unarchiveMessages a function called when the user taps on the unarchive CTA
 * @constructor
 */
const MessagesArchive = ({
  messages,
  navigateToMessageDetail,
  unarchiveMessages
}: Props) => {
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
      image={require("../../../img/messages/empty-message-list-icon.png")}
      title={I18n.t("messages.archive.emptyMessage.title")}
      subtitle={I18n.t("messages.archive.emptyMessage.subtitle")}
    />
  );

  return (
    <View style={[styles.listWrapper, IOStyles.topListBorderBelowTabsStyle]}>
      <View style={styles.listContainer}>
        <MessageList
          filter={{ getArchived: true }}
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
