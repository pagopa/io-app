import { getType } from "typesafe-actions";
import { storeLinkingUrl } from "../actions/linking";
import { Action } from "../actions/types";

export type BackgroundLinkingState = {
  linkingUrl?: string;
};

const INITIAL_STATE: BackgroundLinkingState = {};

export const backgroundLinkingReducer = (
  state: BackgroundLinkingState = INITIAL_STATE,
  action: Action
) => {
  switch (action.type) {
    case getType(storeLinkingUrl):
      return {
        ...state,
        linkingUrl: action.payload
      };
  }
  return state;
};
