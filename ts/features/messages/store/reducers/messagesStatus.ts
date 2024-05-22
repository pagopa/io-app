import { getType } from "typesafe-actions";
import { removeMessages } from "../actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { differentProfileLoggedIn } from "../../../../store/actions/crossSessions";

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
    case getType(removeMessages):
      const idsToRemove = action.payload;
      return Object.keys(state).reduce<MessagesStatus>(
        (acc: MessagesStatus, curr: string) => {
          if (idsToRemove.indexOf(curr) !== -1) {
            return acc;
          }
          return { ...acc, [curr]: state[curr] };
        },
        {} as MessagesStatus
      );
    // clear state if the current profile is different from the previous one
    case getType(differentProfileLoggedIn):
      return INITIAL_STATE;
    default:
      return state;
  }
};

// return messagesStatus
export const messagesStatusSelector = (state: GlobalState) =>
  state.entities.messagesStatus;

export default reducer;
