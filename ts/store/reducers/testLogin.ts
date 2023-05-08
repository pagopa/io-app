import { getType } from "typesafe-actions";
import { Action } from "../actions/types";
import {
  loginFailure,
  loginSuccess,
  testLoginCleanUp,
  testLoginRequest
} from "../actions/authentication";
import { GlobalState } from "./types";

export type TestLoginInitialState = {
  kind: "idle";
};

export type TestLoginSuccessState = {
  kind: "succedeed";
};

export type TestLoginRequestedState = {
  kind: "requested";
};

export type TestLoginFailedState = {
  kind: "failed";
  errorMessage: string;
};

export type TestLoginState =
  | TestLoginInitialState
  | TestLoginSuccessState
  | TestLoginRequestedState
  | TestLoginFailedState;

export const testLoginSelector = (state: GlobalState): TestLoginState =>
  state.features.testLogin;

export const testLoginReducer = (
  state: TestLoginState = { kind: "idle" },
  action: Action
): TestLoginState => {
  switch (action.type) {
    case getType(testLoginCleanUp):
      return {
        kind: "idle"
      };

    case getType(testLoginRequest):
      return {
        kind: "requested"
      };

    case getType(loginSuccess):
      if (action.payload.idp !== "test") {
        return state;
      }
      return {
        kind: "succedeed"
      };

    case getType(loginFailure):
      if (action.payload.idp !== "test") {
        return state;
      }
      return {
        kind: "failed",
        errorMessage: action.payload.error.message
      };

    default:
      return state;
  }
};
