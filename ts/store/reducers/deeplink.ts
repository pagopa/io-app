/**
 * A reducer for deeplink
 */

import { NavigationNavigateActionPayload } from "react-navigation";
import { CLEAR_DEEPLINK, SET_DEEPLINK } from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type DeeplinkState = Readonly<{
  deeplink: NavigationNavigateActionPayload | null;
}>;

const INITIAL_STATE: DeeplinkState = {
  deeplink: null
};

export const deeplinkSelector: NavigationNavigateActionPayload | null = (
  state: GlobalState
) => state.deeplink.deeplink;

export default (
  state: DeeplinkState = INITIAL_STATE,
  action: Action
): DeeplinkState => {
  switch (action.type) {
    case SET_DEEPLINK:
      return {
        deeplink: action.payload
      };

    case CLEAR_DEEPLINK:
      return {
        deeplink: null
      };

    default:
      return state;
  }
};
