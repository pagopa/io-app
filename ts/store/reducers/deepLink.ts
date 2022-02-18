/**
 * A reducer for deep link
 */

import { getType } from "typesafe-actions";

import { clearDeepLink, setDeepLink } from "../actions/deepLink";
import { Action } from "../actions/types";

export type DeepLinkState = Readonly<{
  deepLink: {} | null;
  immediate: boolean;
}>;

const INITIAL_STATE: DeepLinkState = {
  deepLink: null,
  immediate: false
};

export default (
  state: DeepLinkState = INITIAL_STATE,
  action: Action
): DeepLinkState => {
  switch (action.type) {
    case getType(setDeepLink):
      return {
        ...state,
        deepLink: action.payload.navigationPayload,
        immediate: action.payload.immediate
      };

    case getType(clearDeepLink):
      return {
        ...state,
        deepLink: null
      };

    default:
      return state;
  }
};
