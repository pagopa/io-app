/**
 * A reducer for deep link
 */

import { NavigationNavigateActionPayload } from "react-navigation";
import { CLEAR_DEEPLINK, SET_DEEPLINK } from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type DeepLinkState = Readonly<{
  deepLink: NavigationNavigateActionPayload | null;
  immediate: boolean;
}>;

const INITIAL_STATE: DeepLinkState = {
  deepLink: null,
  immediate: false
};

export const deepLinkSelector = (
  state: GlobalState
): NavigationNavigateActionPayload | null => state.deepLink.deepLink;

export default (
  state: DeepLinkState = INITIAL_STATE,
  action: Action
): DeepLinkState => {
  switch (action.type) {
    case SET_DEEPLINK:
      return {
        ...state,
        deepLink: action.payload
      };

    case CLEAR_DEEPLINK:
      return {
        ...state,
        deepLink: null
      };

    default:
      return state;
  }
};
