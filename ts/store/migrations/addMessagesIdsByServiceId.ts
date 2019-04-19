import * as pot from "italia-ts-commons/lib/pot";
import merge from "lodash/merge";

import { messagesStateByIdSelector } from "../reducers/entities/messages/messagesById";
import { MessagesIdsByServiceId } from "../reducers/entities/messages/messagesIdsByServiceId";
import { PersistedGlobalState } from "../reducers/types";

/**
 * A redux-persist migration that using the already stored messages create
 * the new messagesIdsByServiceId section.
 */
export const addMessagesIdsByServiceId = (
  state: PersistedGlobalState
): PersistedGlobalState => {
  const messageStatesById = messagesStateByIdSelector(state);

  const messagesIdsByServiceId: MessagesIdsByServiceId = Object.keys(
    messageStatesById
  ).reduce<MessagesIdsByServiceId>((accumulator, messageId) => {
    const messageState = messageStatesById[messageId];

    if (messageState !== undefined && pot.isSome(messageState.message)) {
      const serviceId = messageState.message.value.sender_service_id;
      const messagesIds = accumulator[serviceId];
      const newMessagesIds =
        messagesIds === undefined ? [messageId] : messagesIds.concat(messageId);
      return {
        ...accumulator,
        [serviceId]: newMessagesIds
      };
    }

    return accumulator;
  }, {});

  const sectionState = {
    entities: {
      messages: {
        idsByServiceId: messagesIdsByServiceId
      }
    }
  };

  return merge({}, state, sectionState);
};
