import { fromNullable } from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import {
  loadMessage,
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

const INITIAL_ITEM_STATE: MessageStatus = { isRead: false, isArchived: false };
const INITIAL_STATE: MessagesStatus = {};

const reducer = (
  state: MessagesStatus = INITIAL_STATE,
  action: Action
): MessagesStatus => {
  switch (action.type) {
    case getType(loadMessage.success): {
      const { id } = action.payload;
      if (state[id] !== undefined) {
        return state;
      }
      return {
        ...state,
        [id]: INITIAL_ITEM_STATE
      };
    }

    case getType(setMessageReadState): {
      const { id, read } = action.payload;
      const prevState = state[id] || INITIAL_ITEM_STATE;
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
        const prevState = state[id];
        if (prevState !== undefined) {
          // tslint:disable-next-line:no-object-mutation
          accumulator[id] = {
            ...prevState,
            isArchived: archived
          };
        }
        return accumulator;
      }, {});
      return {
        ...state,
        ...updatedMessageStates
      };
    }
    case getType(clearCache):
      return INITIAL_STATE;
    default:
      return state;
  }
};

export const messagesStatusSelector = (state: GlobalState) =>
  state.entities.messagesStatus;

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

export const isMessageArchived = (
  messagesStatus: MessagesStatus,
  messageId: string
) =>
  fromNullable(messagesStatus[messageId])
    .map(ms => ms.isArchived)
    .getOrElse(false);

export const isMessageRead = (
  messagesStatus: MessagesStatus,
  messageId: string
) =>
  fromNullable(messagesStatus[messageId])
    .map(ms => ms.isRead)
    .getOrElse(false);

export const messagesUnreadAndUnarchivedSelector = createSelector(
  messagesUnreadSelector,
  messagesUnarchivedSelector,
  (messagesUnread, messageUnarchived) =>
    messagesUnread.filter(
      messageId => messageUnarchived.indexOf(messageId) !== -1
    )
);

export default reducer;
