import { expectSaga, testSaga } from "redux-saga-test-plan";
import { fork, race, select, take } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";

import { analyticsAuthenticationStarted } from "../../../../store/actions/analytics";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { updateLoginMethodProfileAndSuperProperties } from "../../common/analytics/spidAnalytics";
import { updateLoginSessionProfileAndSuperProperties } from "../../fastLogin/analytics/optinAnalytics";
import { watchCieAuthenticationSaga } from "../../login/cie/sagas/cie";
import {
  handleActiveSessionLoginSaga,
  watchActiveSessionLoginSaga
} from "../saga";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  consolidateActiveSessionLoginData,
  setRetryActiveSessionLogin,
  setStartActiveSessionLogin
} from "../store/actions";
import {
  cieIDSelectedSecurityLevelActiveSessionLoginSelector,
  cieLoginFlowSelector,
  idpSelectedActiveSessionLoginSelector,
  isActiveSessionFastLoginEnabledSelector,
  newTokenActiveSessionLoginSelector
} from "../store/selectors";

const mockToken = "mock-token";
const mockIdp = {
  id: "testidp1",
  name: "testidp1",
  logo: { light: { uri: "" } },
  profileUrl: ""
};
const mockOptIn = true;
const mockState = { some: "state" } as any;

describe("handleActiveSessionLoginSaga", () => {
  it("should handle login success and dispatch consolidate + initialization", () =>
    expectSaga(handleActiveSessionLoginSaga)
      .provide([
        [fork(watchCieAuthenticationSaga), null],
        [
          race({
            success: take(activeSessionLoginSuccess),
            failure: take(activeSessionLoginFailure)
          }),
          { success: activeSessionLoginSuccess(mockToken) }
        ],
        [select(newTokenActiveSessionLoginSelector), mockToken],
        [select(idpSelectedActiveSessionLoginSelector), mockIdp],
        [select(cieLoginFlowSelector), "reauth"],
        [select(isActiveSessionFastLoginEnabledSelector), mockOptIn],
        [
          select(cieIDSelectedSecurityLevelActiveSessionLoginSelector),
          "SpidL2"
        ],
        [select(), mockState]
      ])
      .call(updateLoginSessionProfileAndSuperProperties, mockState, "365")
      .call(updateLoginMethodProfileAndSuperProperties, mockState, mockIdp.id)
      .put(
        consolidateActiveSessionLoginData({
          token: mockToken,
          idp: mockIdp,
          fastLoginOptIn: mockOptIn,
          cieIDSelectedSecurityLevel: "SpidL2"
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

  it("should not update properties nor dispatch consolidate/initialization when idp is missing", () =>
    expectSaga(handleActiveSessionLoginSaga)
      .provide([
        [fork(watchCieAuthenticationSaga), null],
        [
          race({
            success: take(activeSessionLoginSuccess),
            failure: take(activeSessionLoginFailure)
          }),
          { success: activeSessionLoginSuccess(mockToken) }
        ],
        [select(newTokenActiveSessionLoginSelector), mockToken],
        [select(idpSelectedActiveSessionLoginSelector), undefined],
        [select(cieLoginFlowSelector), "reauth"],
        [select(isActiveSessionFastLoginEnabledSelector), mockOptIn],
        [select(cieIDSelectedSecurityLevelActiveSessionLoginSelector), "SpidL2"]
      ])
      .not.call.fn(updateLoginSessionProfileAndSuperProperties)
      .not.call.fn(updateLoginMethodProfileAndSuperProperties)
      .not.put(
        consolidateActiveSessionLoginData({
          token: mockToken,
          idp: mockIdp,
          fastLoginOptIn: mockOptIn,
          cieIDSelectedSecurityLevel: "SpidL2"
        })
      )
      .not.put(
        startApplicationInitialization({
          handleSessionExpiration: false,
          showIdentificationModalAtStartup: false,
          isActiveLoginSuccess: true
        })
      )
      .run());

  it("should not update properties nor dispatch consolidate/initialization when token is missing", () =>
    expectSaga(handleActiveSessionLoginSaga)
      .provide([
        [fork(watchCieAuthenticationSaga), null],
        [
          race({
            success: take(activeSessionLoginSuccess),
            failure: take(activeSessionLoginFailure)
          }),
          { success: activeSessionLoginSuccess(mockToken) }
        ],
        [select(newTokenActiveSessionLoginSelector), undefined],
        [select(idpSelectedActiveSessionLoginSelector), mockIdp],
        [select(cieLoginFlowSelector), "reauth"],
        [select(isActiveSessionFastLoginEnabledSelector), mockOptIn],
        [select(cieIDSelectedSecurityLevelActiveSessionLoginSelector), "SpidL2"]
      ])
      .not.call.fn(updateLoginSessionProfileAndSuperProperties)
      .not.call.fn(updateLoginMethodProfileAndSuperProperties)
      .not.put(
        consolidateActiveSessionLoginData({
          token: mockToken,
          idp: mockIdp,
          fastLoginOptIn: mockOptIn,
          cieIDSelectedSecurityLevel: "SpidL2"
        })
      )
      .not.put(
        startApplicationInitialization({
          handleSessionExpiration: false,
          showIdentificationModalAtStartup: false,
          isActiveLoginSuccess: true
        })
      )
      .run());

  it("should handle login failure and dispatch only analytics action", () =>
    expectSaga(handleActiveSessionLoginSaga)
      .provide([
        [fork(watchCieAuthenticationSaga), null],
        [
          race({
            success: take(activeSessionLoginSuccess),
            failure: take(activeSessionLoginFailure)
          }),
          { failure: activeSessionLoginFailure() }
        ],
        [select(newTokenActiveSessionLoginSelector), undefined],
        [select(idpSelectedActiveSessionLoginSelector), undefined],
        [select(cieLoginFlowSelector), "reauth"],
        [select(isActiveSessionFastLoginEnabledSelector), undefined],
        [
          select(cieIDSelectedSecurityLevelActiveSessionLoginSelector),
          undefined
        ]
      ])
      .put(analyticsAuthenticationStarted("reauth"))
      .run());
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
