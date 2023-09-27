export type MessageListCategory = "INBOX" | "ARCHIVE";

const fold = <T>(
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

export default { fold };
