import { getType } from "typesafe-actions";
import { storeLinkingUrl } from "../actions/linking";
import { Action } from "../actions/types";

export type LinkingState = {
  linkingUrl: string | null;
};

const INITIAL_STATE: LinkingState = {
  linkingUrl: null
};

export const linkingReducer = (
  state: LinkingState = INITIAL_STATE,
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
