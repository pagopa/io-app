export type MessageListCategory = "INBOX" | "ARCHIVE";

export const fold = <T>(
  category: MessageListCategory,
  onInbox: () => T,
  onArchive: () => T
): T => {
  switch (category) {
    case "INBOX": {
      return onInbox();
    }
    case "ARCHIVE": {
      return onArchive();
    }
  }
};

export const foldK =
  <T>(onInbox: () => T, onArchive: () => T) =>
  (category: MessageListCategory): T =>
    fold(category, onInbox, onArchive);
