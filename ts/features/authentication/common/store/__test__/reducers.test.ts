import authenticationReducer, { INITIAL_STATE } from "../reducers";
import {
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  sessionInformationLoadSuccess,
  sessionExpired,
  sessionInvalid,
  clearCurrentSession,
  resetAuthenticationState
} from "../actions";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";

const mockError = {
  error: "Network error",
  message: "Something went wrong"
} as any;

describe("authenticationReducer", () => {
  it("should return initial state on clearCurrentSession", () => {
    const state = {
      kind: "LoggedInWithSessionInfo",
      sessionToken: "abc",
      sessionInfo: {},
      idp: "some-idp"
    } as any;
    const action = clearCurrentSession();
    expect(authenticationReducer(state, action)).toEqual(INITIAL_STATE);
  });

  it("should handle refreshSessionToken.success", () => {
    const state = {
      kind: "LoggedInWithoutSessionInfo",
      idp: "idp",
      sessionToken: "old"
    } as any;

    const action = refreshSessionToken.success("new-token");
    expect(authenticationReducer(state, action)).toEqual({
      ...state,
      sessionToken: "new-token"
    });
  });

  it("should handle sessionInformationLoadSuccess", () => {
    const state = {
      kind: "LoggedInWithoutSessionInfo",
      idp: "idp",
      sessionToken: "fakeToken"
    } as any;

    const sessionInfo = { name: "Mario" };
    const action = sessionInformationLoadSuccess(sessionInfo);
    expect(authenticationReducer(state, action)).toEqual({
      ...state,
      kind: "LoggedInWithSessionInfo",
      sessionInfo
    });
  });

  it("should handle logoutRequest", () => {
    const state = {
      kind: "LoggedInWithSessionInfo",
      sessionInfo: {},
      idp: "idp",
      sessionToken: "fakeToken"
    } as any;

    const action = logoutRequest({ withApiCall: false });
    expect(authenticationReducer(state, action)).toEqual({
      ...state,
      kind: "LogoutRequested",
      reason: "NOT_LOGGED_IN"
    });
  });

  it.each([
    ["sessionExpired", sessionExpired()],
    ["sessionInvalid", sessionInvalid()],
    ["logoutSuccess", logoutSuccess()],
    ["logoutFailure", logoutFailure(mockError)]
  ])("should handle logout-type actions: %s", (_, action) => {
    const state = {
      kind: "LoggedInWithSessionInfo",
      idp: "idp",
      sessionToken: "fakeToken",
      sessionInfo: {}
    } as any;

    const expectedReason =
      action.type === sessionExpired().type
        ? "SESSION_EXPIRED"
        : "NOT_LOGGED_IN";

    expect(authenticationReducer(state, action)).toEqual({
      kind: "LoggedOutWithIdp",
      idp: "idp",
      reason: expectedReason
    });
  });

  it("should reset state on resetAuthenticationState if session is expired", () => {
    const state = {
      kind: "LoggedOutWithIdp",
      idp: "idp",
      reason: "SESSION_EXPIRED"
    } as any;

    const action = resetAuthenticationState();
    expect(authenticationReducer(state, action)).toEqual(INITIAL_STATE);
  });

  it("should ignore resetAuthenticationState if session is not expired", () => {
    const state = {
      kind: "LoggedOutWithIdp",
      idp: "idp",
      reason: "NOT_LOGGED_IN"
    } as any;

    const action = resetAuthenticationState();
    expect(authenticationReducer(state, action)).toEqual(state);
  });
});
