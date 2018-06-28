import { testSaga } from "redux-saga-test-plan";

import { BackendClient } from "../../api/backend";
import { apiUrlPrefix } from "../../config";
import { sessionExpired } from "../../store/actions/authentication";
import { SessionToken } from "../../types/SessionToken";
import { callApiWith401ResponseStatusHandler } from "../api";

jest.mock("../../api/backend");

const testSessionToken = "5b1ce7390b108b8f42009b0aa900eefa6dbdc574edf1b76960625478a32ed1f17d7b79f80c4cd7477ad9a0630d1dbd00" as SessionToken;
const mockedBackendClient = BackendClient(apiUrlPrefix, testSessionToken);
const testBackendResponse = {
  message: "Ok"
};

describe("api", () => {
  describe("callApi test plan", () => {
    it("should call the apiCall method with the correct params", () => {
      testSaga(
        callApiWith401ResponseStatusHandler,
        mockedBackendClient.getSession,
        {}
      )
        .next()
        .call(mockedBackendClient.getSession, {});
    });

    it("should return undefined error when the apiCall returns undefined ", () => {
      testSaga(
        callApiWith401ResponseStatusHandler,
        mockedBackendClient.getSession,
        {}
      )
        .next()
        .call(mockedBackendClient.getSession, {})
        .next(undefined)
        .returns(undefined);
    });

    it("should return an error when the apiCall returns a status that is not 200", () => {
      testSaga(
        callApiWith401ResponseStatusHandler,
        mockedBackendClient.getSession,
        {}
      )
        .next()
        .call(mockedBackendClient.getSession, {})
        .next({ status: 500, value: Error("Backend error") })
        .returns({ status: 500, value: Error("Backend error") });
    });

    it("should return an error and dispatch SESSION_EXPIRED when the apiCall returns 401", () => {
      testSaga(
        callApiWith401ResponseStatusHandler,
        mockedBackendClient.getSession,
        {}
      )
        .next()
        .call(mockedBackendClient.getSession, {})
        .next({ status: 401, value: Error("Backend error") })
        .put(sessionExpired())
        .next()
        .returns({ status: 401, value: Error("Backend error") });
    });

    it("should return the result when the apiCall returns 200", () => {
      testSaga(
        callApiWith401ResponseStatusHandler,
        mockedBackendClient.getSession,
        {}
      )
        .next()
        .call(mockedBackendClient.getSession, {})
        .next({ status: 200, value: testBackendResponse })
        .returns({ status: 200, value: testBackendResponse });
    });
  });
});
