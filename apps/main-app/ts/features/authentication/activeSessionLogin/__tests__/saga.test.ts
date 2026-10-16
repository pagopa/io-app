import { expectSaga, testSaga } from "redux-saga-test-plan";
import { call, fork, race, select, take } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";

import { analyticsAuthenticationStarted } from "../../../../store/actions/analytics";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { updateLoginFlowSuperProperty } from "../../common/analytics";
import { updateLoginMethodProfileAndSuperProperties } from "../../common/analytics/spidAnalytics";
import { isOneIdentityLoginEnabledSelector } from "../../common/store/selectors/loginConfig";
import { AUTH_LEVELS, AuthLevel } from "../../common/utils";
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
const AUTH_LEVEL_L2: AuthLevel = AUTH_LEVELS.L2;

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
        [select(isOneIdentityLoginEnabledSelector), true],
        [
          select(cieIDSelectedSecurityLevelActiveSessionLoginSelector),
          AUTH_LEVEL_L2
        ],
        [select(), mockState],
        [call(updateLoginFlowSuperProperty, mockState), undefined]
      ])
      .call(updateLoginSessionProfileAndSuperProperties, mockState, "365")
      .call(updateLoginMethodProfileAndSuperProperties, mockState, mockIdp.id)
      .call(updateLoginFlowSuperProperty, mockState)
      .put(
        consolidateActiveSessionLoginData({
          token: mockToken,
          idp: mockIdp,
          fastLoginOptIn: mockOptIn,
          cieIDSelectedSecurityLevel: AUTH_LEVEL_L2,
          isOneIdentityLogin: true
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
        [select(isOneIdentityLoginEnabledSelector), true],
        [
          select(cieIDSelectedSecurityLevelActiveSessionLoginSelector),
          AUTH_LEVEL_L2
        ]
      ])
      .not.call.fn(updateLoginSessionProfileAndSuperProperties)
      .not.call.fn(updateLoginMethodProfileAndSuperProperties)
      .not.call.fn(updateLoginFlowSuperProperty)
      .not.put(
        consolidateActiveSessionLoginData({
          token: mockToken,
          idp: mockIdp,
          fastLoginOptIn: mockOptIn,
          cieIDSelectedSecurityLevel: AUTH_LEVEL_L2,
          isOneIdentityLogin: true
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
        [select(isOneIdentityLoginEnabledSelector), true],
        [
          select(cieIDSelectedSecurityLevelActiveSessionLoginSelector),
          AUTH_LEVEL_L2
        ]
      ])
      .not.call.fn(updateLoginSessionProfileAndSuperProperties)
      .not.call.fn(updateLoginMethodProfileAndSuperProperties)
      .not.call.fn(updateLoginFlowSuperProperty)
      .not.put(
        consolidateActiveSessionLoginData({
          token: mockToken,
          idp: mockIdp,
          fastLoginOptIn: mockOptIn,
          cieIDSelectedSecurityLevel: AUTH_LEVEL_L2,
          isOneIdentityLogin: true
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
        [select(isOneIdentityLoginEnabledSelector), false],
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
