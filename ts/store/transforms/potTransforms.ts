import { createTransform } from "redux-persist";

import { resetPotStatus } from "../../utils/pot";
import { GlobalState } from "../reducers/types";

/**
 * A redux-persist transformer that reset the status of the pots
 */
export const PotTransform = createTransform(
  // We only care about rehydrated so we do not apply any transformation
  // for inboundState.
  _ => _,
  (outboundState, key) => {
    if (key === "entities") {
      const entitiesState = { ...(outboundState as GlobalState["entities"]) };

      // Reset pots status for messages
      const messagesAllIds = resetPotStatus(entitiesState.messages.allIds);
      const messagesById = { ...entitiesState.messages.byId };
      Object.keys(messagesById).forEach(k => {
        const oldMessageState = messagesById[k];
        if (oldMessageState) {
          // tslint:disable-next-line: no-object-mutation
          messagesById[k] = {
            ...oldMessageState,
            meta: { ...oldMessageState.meta },
            // Reset the pot status
            message: resetPotStatus(oldMessageState.message)
          };
        }
      });
      // tslint:disable-next-line: no-object-mutation
      entitiesState.messages = {
        ...entitiesState.messages,
        allIds: messagesAllIds,
        byId: messagesById
      };

      // Reset pots status for services
      const servicesById = { ...entitiesState.services.byId };
      Object.keys(servicesById).forEach(k => {
        const oldPotServicePublic = servicesById[k];
        if (oldPotServicePublic) {
          // Reset the pot status
          // tslint:disable-next-line: no-object-mutation
          servicesById[k] = resetPotStatus(oldPotServicePublic);
        }
      });
      // tslint:disable-next-line: no-object-mutation
      entitiesState.services = {
        ...entitiesState.services,
        byId: servicesById
      };

      return entitiesState;
    }

    return outboundState;
  }
);
