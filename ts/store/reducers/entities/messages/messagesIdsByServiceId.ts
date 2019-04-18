// A reducer to store messages ids by service id

import { getType } from "typesafe-actions";

import { loadMessage } from "../../../actions/messages";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type MessagesIdsByServiceId = Readonly<{
  [key: string]: ReadonlyArray<string> | undefined;
}>;

export const INITIAL_STATE: MessagesIdsByServiceId = {};

const messagesIdsByServiceIdReducer = (
  state: MessagesIdsByServiceId = INITIAL_STATE,
  action: Action
): MessagesIdsByServiceId => {
  switch (action.type) {
    case getType(loadMessage.success): {
      const message = action.payload;
      const serviceId = message.sender_service_id;
      const messagesIds = state[serviceId];
      const newMessagesIds =
        messagesIds === undefined
          ? [message.id]
          : messagesIds.concat(message.id);
      return {
        ...state,
        [serviceId]: newMessagesIds
      };
    }

    default:
      return state;
  }
};

export const messagesIdsByServiceIdSelector = (state: GlobalState) =>
  state.entities.messages.idsByServiceId;

export default messagesIdsByServiceIdReducer;
