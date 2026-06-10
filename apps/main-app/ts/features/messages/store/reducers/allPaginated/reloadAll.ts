import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { reloadAllMessages } from "../../actions";
import { Action } from "../../../../../store/actions/types";
import { AllPaginated } from "./types";

export const reduceReloadAll = (
  state: AllPaginated,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(reloadAllMessages.request): {
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            ...state.archive,
            data: pot.toLoading(state.archive.data),
            lastRequest: O.some("all")
          }
        };
      }
      return {
        ...state,
        inbox: {
          ...state.inbox,
          data: pot.toLoading(state.inbox.data),
          lastRequest: O.some("all")
        }
      };
    }

    case getType(reloadAllMessages.success): {
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: pot.some({
              page: action.payload.messages,
              previous: action.payload.pagination.previous,
              next: action.payload.pagination.next
            }),
            lastRequest: O.none,
            lastUpdateTime: new Date()
          }
        };
      }
      return {
        ...state,
        inbox: {
          data: pot.some({
            page: action.payload.messages,
            previous: action.payload.pagination.previous,
            next: action.payload.pagination.next
          }),
          lastRequest: O.none,
          lastUpdateTime: new Date()
        }
      };
    }

    case getType(reloadAllMessages.failure):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            ...state.archive,
            data: pot.toError(state.archive.data, {
              reason: action.payload.error.message,
              time: new Date()
            }),
            lastRequest: state.archive.lastRequest
          }
        };
      }
      return {
        ...state,
        inbox: {
          ...state.inbox,
          data: pot.toError(state.inbox.data, {
            reason: action.payload.error.message,
            time: new Date()
          }),
          lastRequest: state.inbox.lastRequest
        }
      };

    default:
      return state;
  }
};
