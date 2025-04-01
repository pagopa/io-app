import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { loginSuccess } from "../../../common/store/actions";

export type LoginInfoState = {
  userFromSuccessLogin: boolean;
};

export const loginInfoReducer = (
  state: LoginInfoState = { userFromSuccessLogin: false },
  action: Action
): LoginInfoState => {
  switch (action.type) {
    case getType(loginSuccess):
      return {
        userFromSuccessLogin: true
      };

    default:
      return state;
  }
};
