import { areSystemsDeadReducer } from "../backendStatus";

describe("backend service status reducer", () => {
  it("should decode the backend status", () => {
    const newState = areSystemsDeadReducer(currentState, responseON);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(0);
    expect(newState.status.isSome()).toBeTruthy();
  });
});
