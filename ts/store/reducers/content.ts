/**
 * Implements the reducers for static content.
 *
 * TODO: add eviction of old entries
 */

import { CONTENT_SERVICE_LOAD_SUCCESS } from "../actions/constants";
import { Action } from "../actions/types";

import { ServiceMetadata } from "../../api/content";

/**
 * Stores useful content such as services and organizations metadata,
 * help pages, etc...
 */
export type ContentState = Readonly<{
  servicesMetadata: {
    byId: {
      [key: string]: ServiceMetadata;
    };
  };
}>;

export const initialContentState: ContentState = {
  servicesMetadata: {
    byId: {}
  }
};

export default function content(
  state: ContentState = initialContentState,
  action: Action
): ContentState {
  if (action.type === CONTENT_SERVICE_LOAD_SUCCESS) {
    return {
      ...state,
      servicesMetadata: {
        byId: {
          ...state.servicesMetadata.byId,
          [action.serviceId]: action.data
        }
      }
    };
  }
  return state;
}
