import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { loginSuccess } from "../../../../../store/actions/authentication";

export type LoginInfoState = {
  loginSucceded: boolean;
};

export const loginInfoReducer = (
  state: LoginInfoState = { loginSucceded: false },
  action: Action
): LoginInfoState => {
  switch (action.type) {
    case getType(loginSuccess):
      return {
        loginSucceded: true
      };

    default:
      return state;
  }
};
