import { CreatedMessageWithContentAndAttachments } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContentAndAttachments";
import { sequenceT } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

// eslint-disable-next-line functional/no-let
let inboxMessages: Array<CreatedMessageWithContentAndAttachments> = [];
// eslint-disable-next-line functional/no-let
let archivedMessages: Array<CreatedMessageWithContentAndAttachments> = [];

const addNewMessage = (message: CreatedMessageWithContentAndAttachments) =>
  pipe({ ...message, is_read: false, is_archived: false }, enrichedMessage => {
    inboxMessages = [enrichedMessage, ...inboxMessages];
    return enrichedMessage;
  });

/**
 * Move the message with ID to the archived collection.
 * Return false if message ID is not in the Inbox.
 */
function archive(id: string): boolean {
  return pipe(
    inboxMessages,
    A.findFirst(message => message.id === id),
    O.fold(
      () => false,
      message => {
        // remove item from inboxMessages
        inboxMessages = inboxMessages.filter(m => m.id !== message.id);
        // add item to archivedMessages
        const destinationIndex = archivedMessages.findIndex(
          m => m.id < message.id
        );
        archivedMessages = A.unsafeInsertAt(
          destinationIndex,
          { ...message, is_archived: true },
          archivedMessages
        );

        return true;
      }
    )
  );
}

function findAllArchived(): ReadonlyArray<CreatedMessageWithContentAndAttachments> {
  return archivedMessages;
}

function findAllInbox(): ReadonlyArray<CreatedMessageWithContentAndAttachments> {
  return inboxMessages;
}

/**
 * Persist a list of messages. The extra attributes is_read and is_archived will
 * be added.
 */
// eslint-disable-next-line: readonly-array no-let
function persist(
  messages: Array<CreatedMessageWithContentAndAttachments>
): void {
  inboxMessages = inboxMessages
    .concat(
      messages.map(m =>
        pipe(
          m,
          m => addBooleanPropertyIfNeeded(m, "is_read"),
          m => addBooleanPropertyIfNeeded(m, "is_archived")
        )
      )
    )
    .sort((a, b) => (a.id < b.id ? 1 : -1));
}

function replaceMessages(
  archived: boolean,
  messages: ReadonlyArray<CreatedMessageWithContentAndAttachments>
): void {
  if (archived) {
    archivedMessages = [...messages];
  } else {
    inboxMessages = [...messages];
  }
}

/**
 * Move the message with ID to the inbox collection.
 * Return false if message ID is not in the Archive.
 */
function unarchive(id: string): boolean {
  return pipe(
    archivedMessages,
    A.findFirst(message => message.id === id),
    O.fold(
      () => false,
      message => {
        // remove item from archivedMessages
        archivedMessages = archivedMessages.filter(m => m.id !== message.id);
        // add item to inboxMessages
        const destinationIndex = inboxMessages.findIndex(
          m => m.id < message.id
        );
        inboxMessages = A.unsafeInsertAt(
          destinationIndex,
          { ...message, is_archived: true },
          inboxMessages
        );

        return true;
      }
    )
  );
}
/**
 * Find one message given its ID, whether it is in the inbox or archived.
 */
const getMessageById = (
  id: string
): CreatedMessageWithContentAndAttachments | undefined =>
  pipe(
    inboxMessages,
    A.findFirst(message => message.id === id),
    O.getOrElse(() =>
      pipe(
        archivedMessages,
        A.findFirst(message => message.id === id),
        O.toUndefined
      )
    )
  );

function dropAll(): void {
  inboxMessages = [];
  archivedMessages = [];
}

/**
 * Set the message `isRead` status to true. The operation cannot be undone.
 * Return false is the message was not found.
 */
function setReadMessage(id: string) {
  return pipe(
    sequenceT(O.Monad)(
      pipe(
        updateMessages(id, inboxMessages),
        O.map(messages => {
          inboxMessages = messages;
          return true;
        }),
        O.getOrElse(() => false),
        O.of
      ),
      pipe(
        updateMessages(id, archivedMessages),
        O.map(messages => {
          archivedMessages = messages;
          return true;
        }),
        O.getOrElse(() => false),
        O.of
      )
    ),
    O.map(args => pipe(args, A.some(identity))),
    O.getOrElse(() => false)
  );
}

function updateMessages(
  id: string,
  messages: Array<CreatedMessageWithContentAndAttachments>
) {
  return pipe(
    messages,
    A.findIndex(message => message.id === id),
    O.map(index =>
      A.unsafeUpdateAt(index, { ...messages[index], is_read: true }, messages)
    )
  );
}

const addBooleanPropertyIfNeeded = (
  message: CreatedMessageWithContentAndAttachments,
  property: string
) => {
  if (property in message) {
    return message;
  }
  return {
    ...message,
    [property]: false
  };
};

export default {
  addNewMessage,
  archive,
  dropAll,
  findAllArchived,
  findAllInbox,
  getMessageById,
  persist,
  replaceMessages,
  setReadMessage,
  unarchive
};
