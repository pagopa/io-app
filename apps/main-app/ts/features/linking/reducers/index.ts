import { getType } from "typesafe-actions";

import { Action } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import { clearLinkingUrl, storeLinkingUrl } from "../actions";

export type BackgroundLinkingState = {
  linkingUrl?: string;
};

const INITIAL_STATE: BackgroundLinkingState = {};

export const backgroundLinkingReducer = (
  state: BackgroundLinkingState = INITIAL_STATE,
  action: Action
) => {
  switch (action.type) {
    case getType(clearLinkingUrl):
      return INITIAL_STATE;
    case getType(storeLinkingUrl):
      return {
        ...state,
        linkingUrl: action.payload
      };
  }
  return state;
};

export const storedLinkingUrlSelector = (state: GlobalState) =>
  state.features.backgroundLinking.linkingUrl;
