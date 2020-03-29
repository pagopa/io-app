import { none } from "fp-ts/lib/Option";
import { BackendStatus } from "../../../api/backendPublic";
import { areSystemsDeadReducer, BackendStatusState } from "../backendStatus";

describe("backend service status reducer", () => {
  // smoke tests: valid / invalid
  const responseON: BackendStatus = {
    is_alive: true,
    message: {
      "it-IT": "messaggio in italiano",
      "en-EN": "english message"
    }
  };

  const responseOff: BackendStatus = {
    is_alive: false,
    message: {
      "it-IT": "messaggio in italiano",
      "en-EN": "english message"
    }
  };

  const currentState: BackendStatusState = {
    status: none,
    areSystemsDead: false,
    deadsCounter: 0
  };

  it("should decode the backend status", () => {
    const newState = areSystemsDeadReducer(currentState, responseON);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(0);
    expect(newState.status.isSome()).toBeTruthy();
  });

  it("should return a new state with alive false", () => {
    // dead one
    const newState = areSystemsDeadReducer(currentState, responseOff);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(1);

    // dead two
    const newState2 = areSystemsDeadReducer(newState, responseOff);
    expect(newState2.areSystemsDead).toBeTruthy();
    expect(newState2.deadsCounter).toEqual(2);
  });

  it("should return a new state with dead counter reset when it processes positive-negative", () => {
    // dead one (positive)
    const newState = areSystemsDeadReducer(currentState, responseOff);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(1);

    // negative
    const newState2 = areSystemsDeadReducer(currentState, responseON);
    expect(newState2.areSystemsDead).toBeFalsy();
    expect(newState2.deadsCounter).toEqual(0);
  });
});
