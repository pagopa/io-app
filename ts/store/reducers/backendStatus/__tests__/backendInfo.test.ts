import * as O from "fp-ts/lib/Option";
import { BackendStatus } from "../../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../../__mock__/backendStatus";
import { BackedInfoState, backendInfoReducer } from "../backendInfo";
import { backendStatusLoadSuccess } from "../../../actions/backendStatus";

describe("backend service status reducer", () => {
  // smoke tests: valid / invalid
  const responseON: BackendStatus = {
    ...baseRawBackendStatus,
    is_alive: true,
    message: {
      "it-IT": "messaggio in italiano",
      "en-EN": "english message"
    }
  };

  const responseOff: BackendStatus = {
    ...baseRawBackendStatus,
    is_alive: false,
    message: {
      "it-IT": "messaggio in italiano",
      "en-EN": "english message"
    }
  };

  const currentState: BackedInfoState = {
    backendInfoMessage: O.none,
    areSystemsDead: false,
    deadsCounter: 0
  };

  it("should decode the backend status", () => {
    const backendStatusLoadSuccessAction = backendStatusLoadSuccess(responseON);
    const newState = backendInfoReducer(
      currentState,
      backendStatusLoadSuccessAction
    );
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(0);
    expect(O.isSome(newState.backendInfoMessage)).toBeTruthy();
  });

  it("should return a new state with alive false", () => {
    // dead one
    const backendStatusLoadSuccessAction1 =
      backendStatusLoadSuccess(responseOff);
    const newState = backendInfoReducer(
      currentState,
      backendStatusLoadSuccessAction1
    );
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(1);

    // dead two
    const backendStatusLoadSuccessAction2 =
      backendStatusLoadSuccess(responseOff);
    const newState2 = backendInfoReducer(
      newState,
      backendStatusLoadSuccessAction2
    );
    expect(newState2.areSystemsDead).toBeTruthy();
    expect(newState2.deadsCounter).toEqual(2);
  });

  it("should return a new state with dead counter reset when it processes positive-negative", () => {
    // dead one (positive)
    const backendStatusLoadSuccessAction1 =
      backendStatusLoadSuccess(responseOff);
    const newState = backendInfoReducer(
      currentState,
      backendStatusLoadSuccessAction1
    );
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(1);

    // negative
    const backendStatusLoadSuccessAction2 =
      backendStatusLoadSuccess(responseON);
    const newState2 = backendInfoReducer(
      currentState,
      backendStatusLoadSuccessAction2
    );
    expect(newState2.areSystemsDead).toBeFalsy();
    expect(newState2.deadsCounter).toEqual(0);
  });
});
