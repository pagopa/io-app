import merge from "lodash/merge";

import { PersistedGlobalState } from "../reducers/types";

/**
 * A redux-persist migration that using the already stored messages create
 * the new messagesIdsByServiceId section.
 */
export const addMessagesIdsByServiceId = (
  state: PersistedGlobalState
): PersistedGlobalState => {
  const sectionState = {
    entities: {
      messages: {
        idsByServiceId: {} // this has been removed after moving to paginated messages.
      }
    }
  };

  return merge({}, state, sectionState);
};
