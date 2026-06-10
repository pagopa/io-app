import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getType } from "typesafe-actions";
import { loadNextPageMessages } from "../../actions";
import { Action } from "../../../../../store/actions/types";
import { AllPaginated, Collection } from "./types";

export const reduceLoadNextPage = (
  state: AllPaginated,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(loadNextPageMessages.request):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            ...state.archive,
            data: pot.toLoading(state.archive.data),
            lastRequest: O.some("next")
          }
        };
      }
      return {
        ...state,
        inbox: {
          ...state.inbox,
          data: pot.toLoading(state.inbox.data),
          lastRequest: O.some("next")
        }
      };

    case getType(loadNextPageMessages.success):
      // we store the previous item only if the list was empty
      const getNextData = (current: Collection) =>
        pipe(
          pot.toOption(current.data),
          O.map(previousState =>
            pot.some({
              ...previousState,
              page: previousState.page.concat(action.payload.messages),
              next: action.payload.pagination.next
            })
          ),
          O.getOrElse(() =>
            pot.some({
              page: [...action.payload.messages],
              next: action.payload.pagination.next
            })
          )
        );

      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            ...state.archive,
            data: getNextData(state.archive),
            lastRequest: O.none
          }
        };
      }

      return {
        ...state,
        inbox: {
          ...state.inbox,
          data: getNextData(state.inbox),
          lastRequest: O.none
        }
      };

    case getType(loadNextPageMessages.failure):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            ...state.archive,
            data: pot.toError(state.inbox.data, {
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
