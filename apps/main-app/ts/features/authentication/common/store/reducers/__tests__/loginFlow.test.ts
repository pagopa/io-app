import { Action } from "../../../../../../store/actions/types";
import {
  consolidateActiveSessionLoginData,
  setLoggedOutUserWithDifferentCF
} from "../../../../activeSessionLogin/store/actions";
import {
  loginFailure,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
  sessionCorrupted,
  sessionExpired,
  sessionInvalid
} from "../../actions";
import { loginFlowInitialState, loginFlowReducer } from "../loginFlow";

const oneIdentityState = { isOneIdentityLogin: true };

describe("loginFlowReducer", () => {
  it("should start as not logged in (undefined)", () => {
    expect(loginFlowReducer(undefined, { type: "UNKNOWN" } as any)).toEqual(
      loginFlowInitialState
    );
  });

  it.each([true, false])(
    "should store isOneIdentityLogin=%s on loginSuccess",
    isOneIdentityLogin => {
      expect(
        loginFlowReducer(
          undefined,
          loginSuccess({ idp: "cie", token: "t", isOneIdentityLogin })
        )
      ).toEqual({ isOneIdentityLogin });
    }
  );

  it.each([true, false])(
    "should store isOneIdentityLogin=%s on consolidateActiveSessionLoginData",
    isOneIdentityLogin => {
      expect(
        loginFlowReducer(
          loginFlowInitialState,
          consolidateActiveSessionLoginData({
            idp: { id: "cie" } as any,
            token: "t",
            fastLoginOptIn: false,
            cieIDSelectedSecurityLevel: undefined,
            isOneIdentityLogin
          })
        )
      ).toEqual({ isOneIdentityLogin });
    }
  );

  it.each<{ action: Action; name: string }>([
    {
      name: "loginFailure",
      action: loginFailure({ error: new Error(), idp: undefined })
    },
    { name: "logoutFailure", action: logoutFailure({ error: new Error() }) },
    { name: "logoutSuccess", action: logoutSuccess() },
    { name: "sessionCorrupted", action: sessionCorrupted() },
    { name: "sessionExpired", action: sessionExpired() },
    { name: "sessionInvalid", action: sessionInvalid() },
    {
      name: "setLoggedOutUserWithDifferentCF",
      action: setLoggedOutUserWithDifferentCF()
    }
  ])("should reset the flag on $name", ({ action }) => {
    expect(loginFlowReducer(oneIdentityState, action)).toEqual(
      loginFlowInitialState
    );
  });

  it("should keep the flag on unrelated actions", () => {
    expect(loginFlowReducer(oneIdentityState, { type: "UNKNOWN" } as any)).toBe(
      oneIdentityState
    );
  });
});
