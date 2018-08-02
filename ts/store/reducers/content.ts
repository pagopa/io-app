/**
 * Implements the reducers for static content.
 *
 * TODO: add eviction of old entries
 * https://www.pivotaltracker.com/story/show/159440294
 */

import {
  CONTENT_ORGANIZATION_LOAD_SUCCESS,
  CONTENT_SERVICE_LOAD_SUCCESS
} from "../actions/constants";
import { Action } from "../actions/types";

import { OrganizationMetadata, ServiceMetadata } from "../../api/content";

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
  organizationsMetadata: {
    byFiscalCode: {
      [key: string]: OrganizationMetadata | undefined;
    };
  };
}>;

export const initialContentState: ContentState = {
  servicesMetadata: {
    byId: {}
  },
  organizationsMetadata: {
    byFiscalCode: {}
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
  } else if (action.type === CONTENT_ORGANIZATION_LOAD_SUCCESS) {
    return {
      ...state,
      organizationsMetadata: {
        byFiscalCode: {
          ...state.organizationsMetadata.byFiscalCode,
          [action.organizationFiscalCode]: action.data
        }
      }
    };
  }
  return state;
}
