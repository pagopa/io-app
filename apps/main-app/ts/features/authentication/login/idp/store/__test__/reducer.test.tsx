import * as pot from "@pagopa/ts-commons/lib/pot";

import {
  resetSpidLoginState,
  setSpidLoginInLoadingState,
  setSpidLoginRequestState
} from "../actions";
import { spidLoginReducer, SpidLoginState } from "../reducers";
import { ErrorType } from "../types";

describe("spidLoginReducer", () => {
  const initialState: SpidLoginState = {
    requestInfo: {
      requestState: pot.noneLoading
    }
  };

  it("should handle setSpidLoginRequestState", () => {
    const newPot: pot.Pot<true, ErrorType> = pot.some(true);
    const state = spidLoginReducer(
      initialState,
      setSpidLoginRequestState(newPot)
    );
    expect(state.requestInfo.requestState).toEqual(newPot);
  });

  it("should handle setSpidLoginInLoadingState", () => {
    const state = spidLoginReducer(initialState, setSpidLoginInLoadingState());
    expect(state.requestInfo.requestState).toEqual(pot.noneLoading);
  });

  it("should handle resetSpidLoginState", () => {
    const modifiedState: SpidLoginState = {
      requestInfo: {
        requestState: pot.some(true)
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
