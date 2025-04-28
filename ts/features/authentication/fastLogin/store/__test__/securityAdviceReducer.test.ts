import {
  INITIAL_STATE,
  SecurityAdviceAcknowledgedState,
  testableSecurityAdviceAcknowledgedReducer
} from "../reducers/securityAdviceReducer";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";
import {
  setSecurityAdviceAcknowledged,
  setSecurityAdviceReadyToShow
} from "../actions/securityAdviceActions";

describe("securityAdviceAcknowledgedReducer", () => {
  if (!testableSecurityAdviceAcknowledgedReducer) {
    throw new Error(
      "securityAdviceAcknowledgedReducer is not available in test environment"
    );
  }
  const securityAdviceAcknowledgedReducer =
    testableSecurityAdviceAcknowledgedReducer.securityAdviceAcknowledgedReducer;

  it("should return initial state by default", () => {
    const state = securityAdviceAcknowledgedReducer(undefined, {
      type: "UNKNOWN_ACTION"
    } as any);
    expect(state).toEqual(INITIAL_STATE);
  });

  it("should reset state if differentProfileLoggedIn and not new install", () => {
    const currentState: SecurityAdviceAcknowledgedState = {
      acknowledged: true,
      readyToShow: true
    };
    const state = securityAdviceAcknowledgedReducer(
      currentState,
      differentProfileLoggedIn({ isNewInstall: false })
    );
    expect(state).toEqual(INITIAL_STATE);
  });

  it("should NOT reset state if differentProfileLoggedIn and is new install", () => {
    const currentState: SecurityAdviceAcknowledgedState = {
      acknowledged: true,
      readyToShow: true
    };
    const state = securityAdviceAcknowledgedReducer(
      currentState,
      differentProfileLoggedIn({ isNewInstall: true })
    );
    expect(state).toEqual(currentState);
  });

  it("should update acknowledged state", () => {
    const currentState = INITIAL_STATE;
    const state = securityAdviceAcknowledgedReducer(
      currentState,
      setSecurityAdviceAcknowledged(true)
    );
    expect(state.acknowledged).toBe(true);
    expect(state.readyToShow).toBe(currentState.readyToShow);
  });

  it("should update readyToShow state", () => {
    const currentState = INITIAL_STATE;
    const state = securityAdviceAcknowledgedReducer(
      currentState,
      setSecurityAdviceReadyToShow(true)
    );
    expect(state.readyToShow).toBe(true);
    expect(state.acknowledged).toBe(currentState.acknowledged);
  });
});
