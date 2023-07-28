import * as O from "fp-ts/lib/Option";
import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";

import { pipe } from "fp-ts/lib/function";
import I18n from "../../i18n";
import { UIMessage } from "../../store/reducers/entities/messages/types";

import { UaDonationsBanner } from "../../features/uaDonations/components/UaDonationsBanner";
import { useItemsSelection } from "../../utils/hooks/useItemsSelection";
import ListSelectionBar from "../ListSelectionBar";
import { IOStyles } from "../core/variables/IOStyles";
import { ItwActionBanner } from "../../features/it-wallet/components/ItwActionBanner";
import { itWalletEnabled } from "../../config";
import { useIOSelector } from "../../store/hooks";
import { itwLifecycleIsOperationalSelector } from "../../features/it-wallet/store/reducers/itwLifecycle";
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
  archiveMessages: (messages: ReadonlyArray<UIMessage>) => void;
};

/**
 * Container for the message inbox.
 * It looks redundant at the moment but will be used later on once we bring back
 * states and filtering in the Messages.
 *
 * @param messages used for handling messages selection
 * @param navigateToMessageDetail
 * @param archiveMessages a function called when the user taps on the archive CTA
 * @constructor
 */
const MessagesInbox = ({
  messages,
  navigateToMessageDetail,
  archiveMessages
}: Props) => {
  const { selectedItems, toggleItem, resetSelection } = useItemsSelection();

  const isSelecting = O.isSome(selectedItems);
  const selectedItemsCount = O.toUndefined(selectedItems)?.size ?? 0;
  const allItemsCount = messages.length;
  const isItWalletOperational = useIOSelector(
    itwLifecycleIsOperationalSelector
  );

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
      pictogram={"airBaloon"}
      title={I18n.t("messages.inbox.emptyMessage.title")}
      subtitle={I18n.t("messages.inbox.emptyMessage.subtitle")}
    />
  );

  return (
    <View style={[styles.listWrapper, IOStyles.topListBorderBelowTabsStyle]}>
      <View style={styles.listContainer}>
        <MessageList
          filter={{ getArchived: false }}
          onPressItem={onPressItem}
          onLongPressItem={onLongPressItem}
          selectedMessageIds={O.toUndefined(selectedItems)}
          ListEmptyComponent={ListEmptyComponent}
          ListHeaderComponent={
            itWalletEnabled && isItWalletOperational ? (
              <ItwActionBanner
                title={I18n.t("features.itWallet.actionBanner.title")}
                content={I18n.t("features.itWallet.actionBanner.description")}
                action={I18n.t("features.itWallet.actionBanner.action")}
                labelClose={I18n.t("features.itWallet.actionBanner.hideLabel")}
              />
            ) : (
              <UaDonationsBanner />
            )
          }
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
