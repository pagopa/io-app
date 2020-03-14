import { right } from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { NonNegativeNumber } from "italia-ts-commons/lib/numbers";
import { BackendServicesStatus } from "../../api/backendPublic";
import { backendServicesStatusLoadSuccess } from "../../store/actions/backendServicesStatus";
import { backendServicesStatusSaga } from "../backendServicesStatus";

jest.mock("react-native-background-timer", () => {
  return {
    BackgroundTimer: { setTimeout: jest.fn }
  };
});

const validResponse: BackendServicesStatus = {
  last_update: new Date(),
  refresh_timeout: (10 * 1000) as NonNegativeNumber
};

describe("backendServicesStatusSaga", () => {
  it("should emit the services status on backend response", () => {
    const getBackendServicesStatus = jest.fn();
    return expectSaga(backendServicesStatusSaga, getBackendServicesStatus)
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
    return expectSaga(backendServicesStatusSaga, getBackendServicesStatus)
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
    return expectSaga(backendServicesStatusSaga, getBackendServicesStatus)
      .not.put(backendServicesStatusLoadSuccess(validResponse))
      .run();
  });
});
