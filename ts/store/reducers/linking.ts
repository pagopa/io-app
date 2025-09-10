import { getType } from "typesafe-actions";
import { storeLinkingUrl } from "../actions/linking";
import { Action } from "../actions/types";

export type LinkingState = {
  linkingUrl?: string;
};

const INITIAL_STATE: LinkingState = {};

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
