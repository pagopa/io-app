import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { loadPreviousPageMessages } from "../../actions";
import { AllPaginated, Collection } from "./types";

const stateKeyFrom = (getArchived?: boolean): "archive" | "inbox" =>
  getArchived ? "archive" : "inbox";

const getPreviousData = (
  current: Collection,
  action: ReturnType<typeof loadPreviousPageMessages.success>
) => {
  const { messages, pagination } = action.payload;
  const existing = pot.toUndefined(current.data);
  const page = messages.concat(existing?.page ?? []);
  // preserve previous if not present or it will be impossible to
  // retrieve further messages
  const previous = pagination.previous ?? existing?.previous;
  return pot.some({ page, next: existing?.next, previous });
};

export const reduceLoadPreviousPage = (
  state: AllPaginated,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(loadPreviousPageMessages.failure): {
      const stateKey = stateKeyFrom(action.payload.filter.getArchived);
      const collection = state[stateKey];
      return {
        ...state,
        [stateKey]: {
          ...collection,
          data: pot.toError(collection.data, {
            reason: action.payload.error.message,
            time: new Date()
          })
        }
      };
    }

    case getType(loadPreviousPageMessages.request): {
      const stateKey = stateKeyFrom(action.payload.filter.getArchived);
      return {
        ...state,
        [stateKey]: {
          ...state[stateKey],
          data: pot.toLoading(state[stateKey].data),
          lastRequest: "previous"
        }
      };
    }

    case getType(loadPreviousPageMessages.success): {
      const stateKey = stateKeyFrom(action.payload.filter.getArchived);
      return {
        ...state,
        [stateKey]: {
          ...state[stateKey],
          data: getPreviousData(state[stateKey], action),
          lastRequest: undefined,
          lastUpdateTime: new Date()
        }
      };
    }

    default:
      return state;
  }
};
