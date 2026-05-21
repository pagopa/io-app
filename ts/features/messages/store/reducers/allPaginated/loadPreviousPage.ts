import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getType } from "typesafe-actions";
import { loadPreviousPageMessages } from "../../actions";
import { Action } from "../../../../../store/actions/types";
import { AllPaginated, Collection } from "./types";

export const reduceLoadPreviousPage = (
  state: AllPaginated,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(loadPreviousPageMessages.request):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            ...state.archive,
            data: pot.toLoading(state.archive.data),
            lastRequest: O.some("previous")
          }
        };
      }
      return {
        ...state,
        inbox: {
          ...state.inbox,
          data: pot.toLoading(state.inbox.data),
          lastRequest: O.some("previous")
        }
      };

    case getType(loadPreviousPageMessages.success):
      const getNextData = (current: Collection) =>
        pipe(
          pot.toOption(current.data),
          O.map(previousState =>
            pot.some({
              ...previousState,
              page: action.payload.messages.concat(previousState.page),
              // preserve previous if not present or it will be impossible to
              // retrieve further messages
              previous:
                action.payload.pagination.previous ?? previousState.previous
            })
          ),
          O.getOrElse(() =>
            pot.some({
              page: [...action.payload.messages],
              previous: action.payload.pagination.previous
            })
          )
        );

      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: getNextData(state.archive),
            lastRequest: O.none,
            lastUpdateTime: new Date()
          }
        };
      }

      return {
        ...state,
        inbox: {
          data: getNextData(state.inbox),
          lastRequest: O.none,
          lastUpdateTime: new Date()
        }
      };

    case getType(loadPreviousPageMessages.failure):
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
