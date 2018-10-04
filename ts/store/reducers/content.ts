/**
 * Implements the reducers for static content.
 *
 * TODO: add eviction of old entries
 * https://www.pivotaltracker.com/story/show/159440294
 */

import { isActionOf } from "typesafe-actions";

import { Service as ServiceMetadata } from "../../../definitions/content/Service";
import { contentServiceLoadSuccess } from "../actions/content";
import { Action } from "../actions/types";

/**
 * Stores useful content such as services and organizations metadata,
 * help pages, etc...
 */
export type ContentState = Readonly<{
  servicesMetadata: {
    byId: {
      [key: string]: ServiceMetadata | undefined;
    };
  };
}>;

const initialContentState: ContentState = {
  servicesMetadata: {
    byId: {}
  }
};

export default function content(
  state: ContentState = initialContentState,
  action: Action
): ContentState {
  if (isActionOf(contentServiceLoadSuccess, action)) {
    return {
      ...state,
      servicesMetadata: {
        byId: {
          ...state.servicesMetadata.byId,
          [action.payload.serviceId]: action.payload.data
        }
      }
    };
  }

  return state;
}
