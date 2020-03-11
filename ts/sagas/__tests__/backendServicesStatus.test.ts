import { right } from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { BackendServicesStatus } from "../../api/backendPublic";
import { backendServicesStatusLoadSuccess } from "../../store/actions/backendServicesStatus";
import { backendServicesStatusSaga } from "../backendServicesStatus";

jest.mock("react-native-background-timer", () => {
  return {
    BackgroundTimer: { setTimeout: jest.fn }
  };
});

describe("backendServicesStatusSaga", () => {
  it("should emit the services status on backend response", () => {
    const getBackendServicesStatus = jest.fn();
    const servicesStatus: BackendServicesStatus = { status: "ok" };
    return expectSaga(backendServicesStatusSaga, getBackendServicesStatus)
      .provide([
        [
          matchers.call.fn(getBackendServicesStatus),
          right({ status: 200, value: servicesStatus })
        ]
      ])
      .put(backendServicesStatusLoadSuccess(servicesStatus))
      .run();
  });

  it("shouldn't emit the services status on backend response status !== 200", () => {
    const getBackendServicesStatus = jest.fn();
    const servicesStatus: BackendServicesStatus = { status: "ok" };
    return expectSaga(backendServicesStatusSaga, getBackendServicesStatus)
      .provide([
        [
          matchers.call.fn(getBackendServicesStatus),
          right({ status: 404, value: servicesStatus })
        ]
      ])
      .not.put(backendServicesStatusLoadSuccess(servicesStatus))
      .run();
  });

  it("shouldn't emit the services status on backend response failure", () => {
    const getBackendServicesStatus = jest.fn(() => {
      throw new Error("network error");
    });
    const servicesStatus: BackendServicesStatus = { status: "ok" };
    return expectSaga(backendServicesStatusSaga, getBackendServicesStatus)
      .not.put(backendServicesStatusLoadSuccess(servicesStatus))
      .run();
  });
});
