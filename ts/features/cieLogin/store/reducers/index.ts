import { Action, getType } from "typesafe-actions";
import { cieLoginDisableUat, cieLoginEnableUat } from "../actions";

export type CieLoginState = {
  useUat: boolean;
};

export const cieLoginInitialState = {
  useUat: false
};

export const cieLoginReducer = (
  state: CieLoginState = cieLoginInitialState,
  action: Action
): CieLoginState => {
  switch (action.type) {
    case getType(cieLoginEnableUat):
      return {
        ...state,
        useUat: true
      };
    case getType(cieLoginDisableUat):
      return {
        ...state,
        useUat: false
      };
    default:
      return state;
  }
};
