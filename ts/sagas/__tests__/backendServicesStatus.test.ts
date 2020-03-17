import { right } from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { BackendStatus } from "../../api/backendPublic";
import { backendServicesStatusLoadSuccess } from "../../store/actions/backendStatus";
import { backendStatusSaga } from "../backendStatus";

jest.mock("react-native-background-timer", () => {
  return {
    BackgroundTimer: { setTimeout: jest.fn }
  };
});

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
  refresh_interval: (10 * 1000).toString()
};

describe("backendServicesStatusSaga", () => {
  it("should emit the services status on backend response", () => {
    const getBackendServicesStatus = jest.fn();
    return expectSaga(backendStatusSaga, getBackendServicesStatus)
      .provide([
        [
          matchers.call.fn(getBackendServicesStatus),
          right({ status: 200, value: validResponse })
        ]
      ])
      .put(backendServicesStatusLoadSuccess(validResponse))
      .run();
  });

  it("shouldn't emit the services status on backend response status !== 200", () => {
    const getBackendServicesStatus = jest.fn();
    return expectSaga(backendStatusSaga, getBackendServicesStatus)
      .provide([
        [
          matchers.call.fn(getBackendServicesStatus),
          right({ status: 404, value: validResponse })
        ]
      ])
      .not.put(backendServicesStatusLoadSuccess(validResponse))
      .run();
  });

  it("shouldn't emit the services status on backend response failure", () => {
    const getBackendServicesStatus = jest.fn(() => {
      throw new Error("network error");
    });
    return expectSaga(backendStatusSaga, getBackendServicesStatus)
      .not.put(backendServicesStatusLoadSuccess(validResponse))
      .run();
  });
});
