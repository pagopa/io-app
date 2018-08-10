import { testSaga } from "redux-saga-test-plan";

import { PublicSession } from "../../../definitions/backend/PublicSession";
import { SpidLevelEnum } from "../../../definitions/backend/SpidLevel";
import { BackendClient } from "../../api/backend";
import { apiUrlPrefix } from "../../config";
import {
  sessionLoadFailure,
  sessionLoadRequest,
  sessionLoadSuccess,
  startAuthentication
} from "../../store/actions/authentication";
import {
  AUTHENTICATION_COMPLETED,
  SESSION_EXPIRED,
  SESSION_LOAD_SUCCESS
} from "../../store/actions/constants";
import { navigationRestore } from "../../store/actions/navigation";
import { sessionTokenSelector } from "../../store/reducers/authentication";
import { navigationStateSelector } from "../../store/reducers/navigation";
import { SessionToken } from "../../types/SessionToken";
import { loadSession, watchSessionExpired } from "../authentication";

jest.mock("react-native-device-info");
jest.mock("react-native-camera");
jest.mock("../../api/backend");

const testSessionToken = "5b1ce7390b108b8f42009b0aa900eefa6dbdc574edf1b76960625478a32ed1f17d7b79f80c4cd7477ad9a0630d1dbd00" as SessionToken;
const testWalletToken =
  "6b1ce7390b108b8f42009b0aa900eefa6dbdc574edf1b76960625478a32ed1f17d7b79f80c4cd7477ad9a0630d1dbd00";

const mockedBackendClient = BackendClient(apiUrlPrefix, testSessionToken);
const testPublicSession: PublicSession = {
  spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL1"],
  walletToken: testWalletToken
};

describe("authentication", () => {
  describe("loadSession test plan", () => {
    it("should dispatch SESSION_LOAD_FAILURE action if SessionToken is undefined", () => {
      testSaga(loadSession)
        .next()
        .select(sessionTokenSelector)
        .next(undefined)
        .put(sessionLoadFailure(Error("No session token")))
        .next()
        .isDone();
    });

    it("should dispatch SESSION_LOAD_FAILURE action if can't get the session from the Backend", () => {
      testSaga(loadSession)
        .next()
        .select(sessionTokenSelector)
        .next(testSessionToken)
        .call(mockedBackendClient.getSession, {})
        .next({ status: 500, value: Error("Backend error") })
        .put(sessionLoadFailure(Error("Backend error")))
        .next()
        .isDone();
    });

    it("should dispatch SESSION_LOAD_SUCCESS action with the data received from the Backend", () => {
      testSaga(loadSession)
        .next()
        .select(sessionTokenSelector)
        .next(testSessionToken)
        .call(mockedBackendClient.getSession, {})
        .next({ status: 200, value: testPublicSession })
        .put(sessionLoadSuccess(testPublicSession))
        .next()
        .isDone();
    });
  });

  describe("watchSessionExpired test plan", () => {
    it("should respect the flow", () => {
      testSaga(watchSessionExpired)
        .next()
        // Wait for SESSION_EXPIRED
        .take(SESSION_EXPIRED)
        .next()
        // Select the navigation state to restore it after
        .select(navigationStateSelector)
        .next({ index: 0, routes: [] })
        .put(startAuthentication())
        .next()
        // Wait for AUTHENTICATION_COMPLETED
        .take(AUTHENTICATION_COMPLETED)
        .next()
        // Load the session info
        .put(sessionLoadRequest())
        .next()
        // Wait for SESSION_LOAD_SUCCESS
        .take(SESSION_LOAD_SUCCESS)
        .next()
        // restore the navigation state
        .put(navigationRestore({ index: 0, routes: [] }))
        .next()
        // Restart the flow
        .take(SESSION_EXPIRED);
    });
  });
});
