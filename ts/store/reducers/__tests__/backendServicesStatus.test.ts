import { none } from "fp-ts/lib/Option";
import { BackendStatus } from "../../../api/backendPublic";
import {
  areSystemsDeadReducer,
  BackendStatusState
} from "../backendServicesStatus";

describe("backend service status reducer", () => {
  // smoke tests: valid / invalid
  const validResponse: BackendStatus = {
    min_app_version: {
      ios: "0.0.0",
      android: "0.0.0"
    },
    min_app_version_pagopa: {
      ios: "0.0.0",
      android: "0.0.0"
    },
    version: "4.7.0",
    last_update: new Date(),
    refresh_interval: "300000"
  };

  const currentState: BackendStatusState = {
    status: none,
    areSystemsDead: false,
    deadsCounter: 0
  };

  it("should return a new state with status updated to the passed one", () => {
    const newState = areSystemsDeadReducer(currentState, validResponse);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(0);
    expect(newState.status.isSome()).toBeTruthy();
    if (newState.status.isSome()) {
      expect(newState.status.value.last_update).toEqual(
        validResponse.last_update
      );
      expect(newState.status.value.refresh_interval).toEqual(
        validResponse.refresh_interval
      );
    }
  });

  it("should return a new state with areSystemsDead equals to true when 2 dead are processed", () => {
    const now = new Date();
    const past1 = new Date(now.getTime() - 60 * 1000); // 1 min ago
    const pastState1 = { ...validResponse, last_update: past1 };

    // dead one
    const newState = areSystemsDeadReducer(currentState, pastState1);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(1);

    // dead two
    const newState2 = areSystemsDeadReducer(newState, pastState1);
    expect(newState2.areSystemsDead).toBeTruthy();
    expect(newState2.deadsCounter).toEqual(2);
  });

  it("should return a new state with dead counter reset when it processes positive-nevative", () => {
    const now = new Date();
    const past1 = new Date(now.getTime() - 60 * 1000); // 1 min ago
    const pastState1 = { ...validResponse, last_update: past1 };

    // dead one (positive)
    const newState = areSystemsDeadReducer(currentState, pastState1);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(1);

    // negative
    const newState2 = areSystemsDeadReducer(newState, {
      ...validResponse,
      last_update: new Date()
    });
    expect(newState2.areSystemsDead).toBeFalsy();
    expect(newState2.deadsCounter).toEqual(0);
  });
});
