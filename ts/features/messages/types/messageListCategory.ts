export type MessageListCategory = "ARCHIVE" | "INBOX";

export const fold = <T>(
  category: MessageListCategory,
  onInbox: () => T,
  onArchive: () => T
): T => {
  switch (category) {
    case "ARCHIVE": {
      return onArchive();
    }
    case "INBOX": {
      return onInbox();
    }
  }
};

export const foldK =
  <T>(onInbox: () => T, onArchive: () => T) =>
  (category: MessageListCategory): T =>
    fold(category, onInbox, onArchive);
