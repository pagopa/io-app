import { SessionToken } from "../../../../types/SessionToken";
import { SpidIdp } from "../../../../utils/idps";
import {
  setStartActiveSessionLogin,
  setIdpSelectedActiveSessionLogin,
  setFastLoginOptSessionLogin,
  activeSessionLoginSuccess,
  activeSessionLoginFailure,
  consolidateActiveSessionLoginData,
  setFinishedActiveSessionLoginFlow
} from "../store/actions";
import {
  ActiveSessionLoginState,
  testable,
  testableReducer
} from "../store/reducer";

const testableInitialState = testable!;
const activeSessionLoginReducer = testableReducer!;

describe("activeSessionLoginReducer", () => {
  it("should return initial state by default", () => {
    const state = activeSessionLoginReducer(undefined, {
      type: "UNKNOWN_ACTION"
    } as any);
    expect(state).toEqual(testableInitialState);
  });

  it("should handle setStartActiveSessionLogin", () => {
    const state = activeSessionLoginReducer(
      testableInitialState,
      setStartActiveSessionLogin()
    );
    expect(state.isActiveSessionLogin).toBe(true);
  });

  it("should handle setIdpSelectedActiveSessionLogin", () => {
    const mockIdp = {
      entityId: "idp-1",
      organizationName: "SPID IDP"
    } as unknown as SpidIdp;
    const state = activeSessionLoginReducer(
      testableInitialState,
      setIdpSelectedActiveSessionLogin(mockIdp)
    );
    expect(state.loginInfo?.idp).toEqual(mockIdp);
  });

  it("should handle setFastLoginOptSessionLogin", () => {
    const state = activeSessionLoginReducer(
      testableInitialState,
      setFastLoginOptSessionLogin(true)
    );
    expect(state.loginInfo?.fastLoginOptIn).toBe(true);
  });

  it("should handle activeSessionLoginSuccess", () => {
    const mockToken = "mock-session-token" as SessionToken;
    const state = activeSessionLoginReducer(
      testableInitialState,
      activeSessionLoginSuccess(mockToken)
    );
    expect(state.isUserLoggedIn).toBe(true);
    expect(state.loginInfo?.token).toBe(mockToken);
  });

  it("should handle activeSessionLoginFailure", () => {
    const prevState: ActiveSessionLoginState = {
      ...testableInitialState,
      isUserLoggedIn: true
    };
    const state = activeSessionLoginReducer(
      prevState,
      activeSessionLoginFailure()
    );
    expect(state.isUserLoggedIn).toBe(false);
  });

  it("should reset state on consolidateActiveSessionLoginData", () => {
    const modifiedState: ActiveSessionLoginState = {
      activeSessionLoginLocalFlag: false,
      isActiveSessionLogin: true,
      isUserLoggedIn: true,
      loginInfo: {
        token: "token" as SessionToken,
        fastLoginOptIn: true
      },
      engagement: {
        hasBlockingScreenBeenVisualized: false
      }
    };
    if (
      modifiedState &&
      modifiedState.loginInfo &&
      modifiedState.loginInfo.token &&
      modifiedState.loginInfo.idp &&
      modifiedState.loginInfo.fastLoginOptIn
    ) {
      const state = activeSessionLoginReducer(
        modifiedState,
        consolidateActiveSessionLoginData({
          token: modifiedState.loginInfo.token,
          idp: modifiedState.loginInfo.idp,
          fastLoginOptIn: modifiedState.loginInfo.fastLoginOptIn
        })
      );
      expect(state).toEqual(testableInitialState);
    }
  });

  it("should reset state on setFinishedActiveSessionLoginFlow", () => {
    const modifiedState: ActiveSessionLoginState = {
      activeSessionLoginLocalFlag: false,
      isActiveSessionLogin: true,
      isUserLoggedIn: true,
      loginInfo: {
        token: "token" as SessionToken,
        fastLoginOptIn: true
      },
      engagement: {
        hasBlockingScreenBeenVisualized: false
      }
    };
    const state = activeSessionLoginReducer(
      modifiedState,
      setFinishedActiveSessionLoginFlow()
    );
    expect(state).toEqual(testableInitialState);
  });
});
