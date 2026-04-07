import {
  askUserToRefreshSessionToken,
  clearPendingAction,
  clearTokenRefreshError,
  refreshSessionToken,
  refreshTokenNoPinError,
  refreshTokenTransientError,
  savePendingAction,
  showRefreshTokenLoader
} from "../actions/tokenRefreshActions";
import {
  FastLoginTokenRefreshReducer,
  testableFastLoginTokenRefreshReducer
} from "../reducers/tokenRefreshReducer";

const dummyAction = { type: "DUMMY_ACTION" };
const aSessionToken = "mock-session-token";

describe("FastLoginTokenRefreshReducer", () => {
  if (!testableFastLoginTokenRefreshReducer) {
    throw new Error(
      "FastLoginTokenRefreshReducer is not available in test environment"
    );
  }
  const FastLoginTokenRefreshHandlerInitialState =
    testableFastLoginTokenRefreshReducer.FastLoginTokenRefreshHandlerInitialState;

  it("should return initial state by default", () => {
    const state = FastLoginTokenRefreshReducer(undefined, dummyAction);
    expect(state).toEqual(FastLoginTokenRefreshHandlerInitialState);
  });

  it("should clear pending actions", () => {
    const initialState = {
      ...FastLoginTokenRefreshHandlerInitialState,
      pendingActions: [dummyAction as any]
    };
    const state = FastLoginTokenRefreshReducer(
      initialState,
      clearPendingAction()
    );
    expect(state.pendingActions).toEqual([]);
  });

  it("should save a pending action", () => {
    const state = FastLoginTokenRefreshReducer(
      FastLoginTokenRefreshHandlerInitialState,
      savePendingAction({ pendingAction: dummyAction as any })
    );
    expect(state.pendingActions).toEqual([dummyAction]);
  });

  it("should set userInteractionForSessionExpiredNeeded to true on request", () => {
    const state = FastLoginTokenRefreshReducer(
      FastLoginTokenRefreshHandlerInitialState,
      askUserToRefreshSessionToken.request()
    );
    expect(state.userInteractionForSessionExpiredNeeded).toBe(true);
  });

  it("should set userInteractionForSessionExpiredNeeded to false on success", () => {
    const initialState = {
      ...FastLoginTokenRefreshHandlerInitialState,
      userInteractionForSessionExpiredNeeded: true
    };
    const state = FastLoginTokenRefreshReducer(
      initialState,
      askUserToRefreshSessionToken.success("yes")
    );
    expect(state.userInteractionForSessionExpiredNeeded).toBe(false);
  });

  it("should set tokenRefresh to in-progress", () => {
    const state = FastLoginTokenRefreshReducer(
      FastLoginTokenRefreshHandlerInitialState,
      showRefreshTokenLoader()
    );
    expect(state.tokenRefresh.kind).toBe("in-progress");
  });

  it("should set tokenRefresh to success with timestamp", () => {
    const state = FastLoginTokenRefreshReducer(
      FastLoginTokenRefreshHandlerInitialState,
      refreshSessionToken.success(aSessionToken)
    );
    expect(state.tokenRefresh.kind).toBe("success");
    if (state.tokenRefresh.kind === "success") {
      expect(typeof state.tokenRefresh.timestamp).toBe("number");
    }
  });

  it("should set tokenRefresh to error on failure", () => {
    const state = FastLoginTokenRefreshReducer(
      FastLoginTokenRefreshHandlerInitialState,
      refreshSessionToken.failure(new Error("fail"))
    );
    expect(state.tokenRefresh.kind).toBe("error");
  });

  it("should set tokenRefresh to transient-error", () => {
    const state = FastLoginTokenRefreshReducer(
      FastLoginTokenRefreshHandlerInitialState,
      refreshTokenTransientError()
    );
    expect(state.tokenRefresh.kind).toBe("transient-error");
  });

  it("should set tokenRefresh to no-pin-error", () => {
    const state = FastLoginTokenRefreshReducer(
      FastLoginTokenRefreshHandlerInitialState,
      refreshTokenNoPinError()
    );
    expect(state.tokenRefresh.kind).toBe("no-pin-error");
  });

  it("should reset tokenRefresh to idle", () => {
    const currentState = {
      ...FastLoginTokenRefreshHandlerInitialState,
      tokenRefresh: { kind: "error" as const }
    };
    const state = FastLoginTokenRefreshReducer(
      currentState,
      clearTokenRefreshError()
    );
    expect(state.tokenRefresh.kind).toBe("idle");
  });
});
