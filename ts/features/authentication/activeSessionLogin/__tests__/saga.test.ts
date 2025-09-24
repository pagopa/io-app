import { expectSaga, testSaga } from "redux-saga-test-plan";
import { select, race, take, fork } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import {
  activeSessionLoginSuccess,
  activeSessionLoginFailure,
  consolidateActiveSessionLoginData,
  setRetryActiveSessionLogin,
  setStartActiveSessionLogin
} from "../store/actions";
import {
  fastLoginOptInActiveSessionLoginSelector,
  idpSelectedActiveSessionLoginSelector,
  newTokenActiveSessionLoginSelector
} from "../store/selectors";
import { startApplicationInitialization } from "../../../../store/actions/application";
import {
  handleActiveSessionLoginSaga,
  watchActiveSessionLoginSaga
} from "../saga";
import { SessionToken } from "../../../../types/SessionToken";
import { watchCieAuthenticationSaga } from "../../login/cie/sagas/cie";

const mockToken = "mock-token" as SessionToken;
const mockIdp = {
  id: "testidp1",
  name: "testidp1",
  logo: { light: { uri: "" } },
  profileUrl: ""
};
const mockOptIn = true;

describe("handleActiveSessionLoginSaga", () => {
  it("should handle login success and dispatch consolidate + initialization", () =>
    expectSaga(handleActiveSessionLoginSaga)
      .provide([
        [
          race({
            success: take(activeSessionLoginSuccess),
            failure: take(activeSessionLoginFailure)
          }),
          { success: activeSessionLoginSuccess(mockToken) }
        ],
        [select(newTokenActiveSessionLoginSelector), mockToken],
        [select(idpSelectedActiveSessionLoginSelector), mockIdp],
        [select(fastLoginOptInActiveSessionLoginSelector), mockOptIn]
      ])
      .put(
        consolidateActiveSessionLoginData({
          token: mockToken,
          idp: mockIdp,
          fastLoginOptIn: mockOptIn
        })
      )
      .put(
        startApplicationInitialization({
          handleSessionExpiration: false,
          showIdentificationModalAtStartup: false,
          isActiveLoginSuccess: true
        })
      )
      .run());

  it("should handle login failure and not dispatch anything", () =>
    expectSaga(handleActiveSessionLoginSaga)
      .provide([
        [fork(watchCieAuthenticationSaga), null],
        [
          race({
            success: take(activeSessionLoginSuccess),
            failure: take(activeSessionLoginFailure)
          }),
          { failure: activeSessionLoginFailure() }
        ]
      ])
      .run()
      .then(result => {
        expect(result.effects.put).toBeUndefined();
      }));
});

describe("watchActiveSessionLoginSaga", () => {
  it("should wait for setStartActiveSessionLogin or setRetryActiveSessionLogin and call handler", () => {
    testSaga(watchActiveSessionLoginSaga)
      .next()
      .takeLatest(
        [
          getType(setStartActiveSessionLogin),
          getType(setRetryActiveSessionLogin)
        ],
        handleActiveSessionLoginSaga
      )
      .next()
      .isDone();
  });
});
