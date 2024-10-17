import { getType } from "typesafe-actions";
import { setIsBlockingScreen } from "../actions";
import { Action } from "../../../../store/actions/types";

export type IngressScreenState = {
  isBlockingScreen: boolean;
};

export const initialIngressScreenState: IngressScreenState = {
  isBlockingScreen: false
};

export const ingressScreenReducer = (
  state = initialIngressScreenState,
  action: Action
): IngressScreenState => {
  switch (action.type) {
    case getType(setIsBlockingScreen):
      return {
        ...state,
        isBlockingScreen: true
      };
    default:
      return state;
  }
};
