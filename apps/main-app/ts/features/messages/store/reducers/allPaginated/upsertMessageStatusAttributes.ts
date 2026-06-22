import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { upsertMessageStatusAttributes } from "../../actions";
import { Action } from "../../../../../store/actions/types";
import { UIMessage } from "../../../types";
import { AllPaginated, Collection } from "./types";

/**
 * Implements an optimistic UI by updating the state at request time and rolling back the updates
 * in case of failure.
 *
 * @param state
 * @param action
 */
export const reduceUpsertMessageStatusAttributes = (
  state: AllPaginated,
  action: Action
): AllPaginated => {
  const remove = (message: UIMessage, from: Collection) =>
    refreshCursors({
      ...from,
      data: pot.map(from.data, old => ({
        ...old,
        page: old.page.filter(_ => _.id !== message.id)
      }))
    });

  // Messages are inserted locally ONLY if their ID is within the
  // pages that were already fetched. Otherwise, the moved message
  // will be returned by the backend once the user scrolls to that
  // particular page.
  const insert = (message: UIMessage, to: Collection) =>
    refreshCursors({
      ...to,
      data: pot.map(to.data, old => ({
        ...old,
        page:
          old.next === undefined ||
          old.next.localeCompare(message.id, "en") <= 0
            ? [...old.page, message].sort((a, b) =>
                b.id.localeCompare(a.id, "en")
              )
            : old.page
      }))
    });

  // Replaces a message with the same ID in the collection (if found)
  const replace = (message: UIMessage, collection: Collection): Collection => ({
    ...collection,
    data: pot.map(collection.data, old => ({
      ...old,
      page: old.page.map(oldMessage =>
        oldMessage.id === message.id ? message : oldMessage
      )
    }))
  });

  const refreshCursors = (of: Collection): Collection => ({
    ...of,
    data: pot.map(of.data, old => ({
      ...old,
      previous: old.page[0]?.id
      // there's no need to update `next` as:
      // 1. we never insert messages older than `next`
      // 2. removing the last message of the page keeps pagination
      //    working in the backend (i.e. messages older than `next`
      //    are returned even if `next` is not in the inbox/archive
      //    anymore)
    }))
  });

  switch (action.type) {
    case getType(upsertMessageStatusAttributes.request): {
      const message = action.payload.message;
      if (message) {
        const { update } = action.payload;
        const isRead =
          update.tag === "reading" || update.tag === "bulk" || message.isRead;

        if (update.tag === "reading") {
          return {
            ...state,
            archive: replace({ ...message, isRead }, state.archive),
            inbox: replace({ ...message, isRead }, state.inbox)
          };
        }

        if (update.tag === "bulk" || update.tag === "archiving") {
          if (update.isArchived) {
            return {
              ...state,
              archive: insert(
                { ...message, isRead, isArchived: true },
                state.archive
              ),
              inbox: remove(message, state.inbox)
            };
          } else {
            return {
              ...state,
              archive: remove(message, state.archive),
              inbox: insert(
                { ...message, isRead, isArchived: false },
                state.inbox
              )
            };
          }
        }
      }
      return state;
    }

    case getType(upsertMessageStatusAttributes.failure): {
      const message = action.payload.payload.message;
      if (message) {
        const { update } = action.payload.payload;

        if (update.tag === "reading") {
          return {
            ...state,
            archive: replace(message, state.archive),
            inbox: replace(message, state.inbox)
          };
        }

        if (update.tag === "bulk" || update.tag === "archiving") {
          if (update.isArchived) {
            return {
              ...state,
              archive: remove(message, state.archive),
              inbox: insert(message, state.inbox)
            };
          } else {
            return {
              ...state,
              archive: insert(message, state.archive),
              inbox: remove(message, state.inbox)
            };
          }
        }
      }
      return state;
    }
    default:
      return state;
  }
};
