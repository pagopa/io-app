/**
 * A reduced for deferred actions.
 */

import {
  CLEAR_DEFERRED_ACTIONS,
  PUSH_TO_DEFERRED_ACTIONS
} from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type DeferredActionsState = ReadonlyArray<Action>;

const INITIAL_STATE: DeferredActionsState = [];

export const deferredActionsSelector = (
  state: GlobalState
): DeferredActionsState => state.deferred;

export default (
  state: DeferredActionsState = INITIAL_STATE,
  action: Action
) => {
  switch (action.type) {
    case PUSH_TO_DEFERRED_ACTIONS:
      return [...state, action.payload];

    case CLEAR_DEFERRED_ACTIONS:
      return [];

    default:
      return state;
  }
};
