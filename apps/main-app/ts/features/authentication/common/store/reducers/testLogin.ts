import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  loginFailure,
  loginSuccess,
  testLoginCleanUp,
  testLoginRequest
} from "../actions";

export type TestLoginFailedState = {
  errorMessage: string;
  kind: "failed";
};

export type TestLoginInitialState = {
  kind: "idle";
};

export type TestLoginRequestedState = {
  kind: "requested";
};

export type TestLoginState =
  | TestLoginFailedState
  | TestLoginInitialState
  | TestLoginRequestedState
  | TestLoginSuccessState;

export type TestLoginSuccessState = {
  kind: "succedeed";
};

export const testLoginSelector = (state: GlobalState): TestLoginState =>
  state.features.loginFeatures.testLogin;

export const testLoginReducer = (
  state: TestLoginState = { kind: "idle" },
  action: Action
): TestLoginState => {
  switch (action.type) {
    case getType(loginFailure):
      if (action.payload.idp !== "test") {
        return state;
      }
      return {
        kind: "failed",
        errorMessage: action.payload.error.message
      };

    case getType(loginSuccess):
      if (action.payload.idp !== "test") {
        return state;
      }
      return {
        kind: "succedeed"
      };

    case getType(testLoginCleanUp):
      return {
        kind: "idle"
      };

    case getType(testLoginRequest):
      return {
        kind: "requested"
      };

    default:
      return state;
  }
};
