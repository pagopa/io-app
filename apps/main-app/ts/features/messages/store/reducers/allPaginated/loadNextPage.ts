import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { loadNextPageMessages } from "../../actions";
import { Action } from "../../../../../store/actions/types";
import { AllPaginated, Collection } from "./types";

const stateKeyFrom = (getArchived?: boolean): "archive" | "inbox" =>
  getArchived ? "archive" : "inbox";

const getNextData = (
  current: Collection,
  action: ReturnType<typeof loadNextPageMessages.success>
) => {
  const { messages, pagination } = action.payload;
  const existing = pot.toUndefined(current.data);
  const page = existing?.page.concat(messages) ?? [...messages];
  return pot.some({
    page,
    next: pagination.next,
    previous: existing?.previous
  });
};

export const reduceLoadNextPage = (
  state: AllPaginated,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(loadNextPageMessages.request): {
      const stateKey = stateKeyFrom(action.payload.filter.getArchived);
      return {
        ...state,
        [stateKey]: {
          ...state[stateKey],
          data: pot.toLoading(state[stateKey].data),
          lastRequest: "next"
        }
      };
    }

    case getType(loadNextPageMessages.success): {
      const stateKey = stateKeyFrom(action.payload.filter.getArchived);
      return {
        ...state,
        [stateKey]: {
          ...state[stateKey],
          data: getNextData(state[stateKey], action),
          lastRequest: undefined
        }
      };
    }

    case getType(loadNextPageMessages.failure): {
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

    default:
      return state;
  }
};
