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

type ItemState = {
  isRead: boolean;
  isArchived: boolean;
};

export type MessageItemsState = Readonly<{
  [key: string]: ItemState;
}>;

const INITIAL_ITEM_STATE: ItemState = { isRead: false, isArchived: false };
const INITIAL_STATE: MessageItemsState = {};

const reducer = (
  state: MessageItemsState = INITIAL_STATE,
  action: Action
): MessageItemsState => {
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
      const prevState = state[id];
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
        [key: string]: ItemState;
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

export const messageItems = (state: GlobalState) => state.entities.messageItems;

export const messagesUnreadSelector = createSelector(messageItems, items => {
  return Object.keys(items).filter(messageId =>
    fromNullable(items[messageId])
      .map(item => item.isRead === false)
      .getOrElse(true)
  );
});

export const messagesReadSelector = createSelector(messageItems, items => {
  return Object.keys(items).filter(messageId =>
    fromNullable(items[messageId])
      .map(item => item.isRead === true)
      .getOrElse(false)
  );
});

export const messagesArchivedSelector = createSelector(messageItems, items => {
  return Object.keys(items).filter(messageId =>
    fromNullable(items[messageId])
      .map(item => item.isArchived === true)
      .getOrElse(false)
  );
});

export const messagesUnarchivedSelector = createSelector(
  messageItems,
  items => {
    return Object.keys(items).filter(messageId =>
      fromNullable(items[messageId])
        .map(item => item.isArchived === false)
        .getOrElse(true)
    );
  }
);

export const messagesUnreadAndUnarchivedSelector = createSelector(
  messagesUnreadSelector,
  messagesUnarchivedSelector,
  (messagesUnread, messageUnarchived) =>
    messagesUnread.filter(
      messageId => messageUnarchived.indexOf(messageId) !== -1
    )
);

export default reducer;
