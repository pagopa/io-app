import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  incrementNativeLoginNativeAttempts,
  setStandardLoginRequestState,
  setNativeLoginRequestInfo,
  setStandardLoginInLoadingState,
  resetSpidLoginState
} from "../actions";
import { spidLoginReducer, SpidLoginState } from "../reducers";
import { ErrorType } from "../types";

describe("spidLoginReducer", () => {
  const initialState: SpidLoginState = {
    nativeLogin: {
      requestInfo: {
        requestState: "LOADING",
        nativeAttempts: 0
      }
    },
    standardLogin: {
      requestInfo: {
        requestState: pot.noneLoading
      }
    }
  };

  it("should handle setNativeLoginRequestInfo", () => {
    const action = setNativeLoginRequestInfo({
      requestState: "ERROR",
      errorType: ErrorType.LOADING_ERROR,
      nativeAttempts: 2
    });
    const state = spidLoginReducer(initialState, action);
    expect(state.nativeLogin.requestInfo).toEqual(action.payload);
  });

  it("should handle incrementNativeLoginNativeAttempts", () => {
    const state = spidLoginReducer(
      initialState,
      incrementNativeLoginNativeAttempts()
    );
    expect(state.nativeLogin.requestInfo.nativeAttempts).toBe(1);
    expect(state.nativeLogin.requestInfo.requestState).toBe("LOADING");
  });

  it("should handle setStandardLoginRequestState", () => {
    const newPot: pot.Pot<true, ErrorType> = pot.some(true);
    const state = spidLoginReducer(
      initialState,
      setStandardLoginRequestState(newPot)
    );
    expect(state.standardLogin.requestInfo.requestState).toEqual(newPot);
  });

  it("should handle setStandardLoginInLoadingState", () => {
    const state = spidLoginReducer(
      initialState,
      setStandardLoginInLoadingState()
    );
    expect(state.standardLogin.requestInfo.requestState).toEqual(
      pot.noneLoading
    );
  });

  it("should handle resetSpidLoginState", () => {
    const modifiedState: SpidLoginState = {
      nativeLogin: {
        requestInfo: {
          requestState: "ERROR",
          errorType: ErrorType.LOGIN_ERROR,
          nativeAttempts: 99
        }
      },
      standardLogin: {
        requestInfo: {
          requestState: pot.some(true)
        }
      }
    };

    const state = spidLoginReducer(modifiedState, resetSpidLoginState());
    expect(state).toEqual(initialState);
  });

  it("should return current state for unknown action", () => {
    const state = spidLoginReducer(initialState, { type: "UNKNOWN" } as any);
    expect(state).toEqual(initialState);
  });
});
