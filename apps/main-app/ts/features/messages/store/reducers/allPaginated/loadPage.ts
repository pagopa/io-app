import * as pot from "@pagopa/ts-commons/lib/pot";
import { ActionType, getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { loadNextPageMessages, loadPreviousPageMessages } from "../../actions";
import { AllPaginated, Collection } from "./types";

const stateKeyFrom = (getArchived?: boolean): "archive" | "inbox" =>
  getArchived ? "archive" : "inbox";

const getPageSuccessData = (
  action:
    | ActionType<typeof loadNextPageMessages.success>
    | ActionType<typeof loadPreviousPageMessages.success>,
  collection: Collection
) => {
  const existing = pot.toUndefined(collection.data);
  if (action.type === getType(loadNextPageMessages.success)) {
    const { messages, pagination } = action.payload;
    const page = existing?.page.concat(messages) ?? messages;

    const nextPageData = pagination.next;
    const previousPageData = existing?.previous;

    return { nextPageData, previousPageData, page, lastUpdateTime: undefined };
  }
  const { messages, pagination } = action.payload;
  const page = messages.concat(existing?.page ?? []);

  const nextPageData = existing?.next;
  const previousPageData = pagination.previous ?? existing?.previous;

  return { nextPageData, previousPageData, page, lastUpdateTime: new Date() };
};

export const reduceLoadPage = (
  state: AllPaginated,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(loadNextPageMessages.request):
    case getType(loadPreviousPageMessages.request): {
      const direction =
        action.type === getType(loadNextPageMessages.request)
          ? "next"
          : "previous";
      const stateKey = stateKeyFrom(action.payload.filter.getArchived);
      return {
        ...state,
        [stateKey]: {
          ...state[stateKey],
          data: pot.toLoading(state[stateKey].data),
          lastRequest: direction
        }
      };
    }

    case getType(loadNextPageMessages.success):
    case getType(loadPreviousPageMessages.success): {
      const stateKey = stateKeyFrom(action.payload.filter.getArchived);
      const inboxOrArchiveState = state[stateKey];
      const { nextPageData, previousPageData, page, lastUpdateTime } =
        getPageSuccessData(action, inboxOrArchiveState);

      const data = pot.some({
        page,
        next: nextPageData,
        previous: previousPageData
      });
      return {
        ...state,
        [stateKey]: {
          ...inboxOrArchiveState,
          data,
          lastRequest: undefined,
          lastUpdateTime: lastUpdateTime ?? inboxOrArchiveState.lastUpdateTime
        }
      };
    }

    case getType(loadNextPageMessages.failure):
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

    default:
      return state;
  }
};
