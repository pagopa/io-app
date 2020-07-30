import { fromNullable } from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import {
  loadMessage,
  removeMessages,
  setMessageReadState,
  setMessagesArchivedState
} from "../../../actions/messages";
import { clearCache } from "../../../actions/profile";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type MessageStatus = {
  isRead: boolean;
  isArchived: boolean;
};

export type MessagesStatus = Readonly<{
  [key: string]: MessageStatus | undefined;
}>;

export const EMPTY_MESSAGE_STATUS: MessageStatus = {
  isRead: false,
  isArchived: false
};
const INITIAL_STATE: MessagesStatus = {};

const reducer = (
  state: MessagesStatus = INITIAL_STATE,
  action: Action
): MessagesStatus => {
  switch (action.type) {
    case getType(loadMessage.success): {
      const { id } = action.payload;
      // if hits, skip it!
      if (state[id] !== undefined) {
        return state;
      }
      return {
        ...state,
        [id]: EMPTY_MESSAGE_STATUS
      };
    }

    case getType(setMessageReadState): {
      const { id, read } = action.payload;
      // if misses, set the default values for given message
      const prevState = state[id] || EMPTY_MESSAGE_STATUS;
      return {
        ...state,
        [id]: {
          ...prevState,
          isRead: read
        }
      };
    }
    case getType(setMessagesArchivedState): {
      const { ids, archived } = action.payload;
      const updatedMessageStates = ids.reduce<{
        [key: string]: MessageStatus;
      }>((accumulator, id) => {
        // if misses, set the default values for given message
        const prevState = state[id] || EMPTY_MESSAGE_STATUS;
        return {
          ...accumulator,
          [id]: {
            ...prevState,
            isArchived: archived
          }
        };
      }, {});
      return {
        ...state,
        ...updatedMessageStates
      };
    }
    case getType(removeMessages):
      const idsToRemove = action.payload;
      return Object.keys(state).reduce((acc, curr) => {
        if (idsToRemove.indexOf(curr) !== -1) {
          return acc;
        }
        return { ...acc, [curr]: state[curr] };
      }, {});
    default:
      return state;
  }
};

// return messagesStatus
export const messagesStatusSelector = (state: GlobalState) =>
  state.entities.messagesStatus;

// return all unread messages id
export const messagesUnreadSelector = createSelector(
  messagesStatusSelector,
  items => {
    return Object.keys(items).filter(messageId =>
      fromNullable(items[messageId])
        .map(item => item.isRead === false)
        .getOrElse(true)
    );
  }
);

// return all read messages id
export const messagesReadSelector = createSelector(
  messagesStatusSelector,
  items => {
    return Object.keys(items).filter(messageId =>
      fromNullable(items[messageId])
        .map(item => item.isRead === true)
        .getOrElse(false)
    );
  }
);

// return all archived messages id
export const messagesArchivedSelector = createSelector(
  messagesStatusSelector,
  items => {
    return Object.keys(items).filter(messageId =>
      fromNullable(items[messageId])
        .map(item => item.isArchived === true)
        .getOrElse(false)
    );
  }
);

// return all unarchived messages id
export const messagesUnarchivedSelector = createSelector(
  messagesStatusSelector,
  items => {
    return Object.keys(items).filter(messageId =>
      fromNullable(items[messageId])
        .map(item => item.isArchived === false)
        .getOrElse(true)
    );
  }
);

// return all unarchived and unread messages id
export const messagesUnreadAndUnarchivedSelector = createSelector(
  messagesUnreadSelector,
  messagesUnarchivedSelector,
  (messagesUnread, messageUnarchived) =>
    messagesUnread.filter(
      messageId => messageUnarchived.indexOf(messageId) !== -1
    )
);

// some util functions
// return true if message is archived
export const isMessageArchived = (
  messagesStatus: MessagesStatus,
  messageId: string
) =>
  fromNullable(messagesStatus[messageId])
    .map(ms => ms.isArchived)
    .getOrElse(false);

// return true if message is read
export const isMessageRead = (
  messagesStatus: MessagesStatus,
  messageId: string
) =>
  fromNullable(messagesStatus[messageId])
    .map(ms => ms.isRead)
    .getOrElse(false);

export default reducer;
