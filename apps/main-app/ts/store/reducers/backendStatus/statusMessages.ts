import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { StatusMessage } from "../../../../definitions/content/StatusMessage";
import { backendStatusLoadSuccess } from "../../actions/backendStatus";
import { Action } from "../../actions/types";
import { currentRouteSelector } from "../navigation";
import { GlobalState } from "../types";

export type StatusMessagesState = O.Option<BackendStatus["statusMessages"]>;

const initialStatusMessagesState: StatusMessagesState = O.none;

export default function statusMessagesReducer(
  state: StatusMessagesState = initialStatusMessagesState,
  action: Action
): StatusMessagesState {
  if (action.type === getType(backendStatusLoadSuccess)) {
    return O.fromNullable(action.payload.statusMessages);
  }
  return state;
}

const statusMessagesSelector = (state: GlobalState) =>
  pipe(state, s => s.statusMessages, O.toUndefined);

const EMPTY_ARRAY: ReadonlyArray<StatusMessage> = [];

// Since the return of the selector comes from an array.filter function it is important to cache the result
// to avoid unintended rerender on components.
export const statusMessageByRouteSelector = createSelector(
  [statusMessagesSelector, currentRouteSelector],
  (statusMessages, currentRoute): ReadonlyArray<StatusMessage> | undefined =>
    pipe(
      statusMessages,
      O.fromNullable,
      O.map(({ items }) => {
        const messages = items.filter(message =>
          message.routes.includes(currentRoute)
        );
        return messages.length > 0 ? messages : EMPTY_ARRAY;
      }),
      O.toUndefined
    )
);
