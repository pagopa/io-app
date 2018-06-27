import { left, right } from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";

import { BackendClient } from "../../api/backend";
import { apiUrlPrefix } from "../../config";
import { sessionExpired } from "../../store/actions/authentication";
import { SessionToken } from "../../types/SessionToken";
import { callApi } from "../api";

jest.mock("../../api/backend");

const testSessionToken = "5b1ce7390b108b8f42009b0aa900eefa6dbdc574edf1b76960625478a32ed1f17d7b79f80c4cd7477ad9a0630d1dbd00" as SessionToken;
const mockedBackendClient = BackendClient(apiUrlPrefix, testSessionToken);
const testBackendResponse = {
  message: "Ok"
};

describe("api", () => {
  describe("callApi test plan", () => {
    it("should call the apiCall method with the correct params", () => {
      testSaga(callApi, mockedBackendClient.getSession, {})
        .next()
        .call(mockedBackendClient.getSession, {});
    });

    it("should return left with an empty error when the apiCall returns undefined ", () => {
      testSaga(callApi, mockedBackendClient.getSession, {})
        .next()
        .call(mockedBackendClient.getSession, {})
        .next(undefined)
        .returns(left(Error()));
    });

    it("should return left with an error when the apiCall returns a status that is not 200", () => {
      testSaga(callApi, mockedBackendClient.getSession, {})
        .next()
        .call(mockedBackendClient.getSession, {})
        .next({ status: 500, value: Error("Backend error") })
        .returns(left(Error("Backend error")));
    });

    it("should return left with an error and dispatch SESSION_EXPIRED when the apiCall returns 401", () => {
      testSaga(callApi, mockedBackendClient.getSession, {})
        .next()
        .call(mockedBackendClient.getSession, {})
        .next({ status: 401, value: Error("Backend error") })
        .put(sessionExpired())
        .next()
        .returns(left(Error("Backend error")));
    });

    it("should return right with the result when the apiCall returns 200", () => {
      testSaga(callApi, mockedBackendClient.getSession, {})
        .next()
        .call(mockedBackendClient.getSession, {})
        .next({ status: 200, value: testBackendResponse })
        .returns(right(testBackendResponse));
    });
  });
});
