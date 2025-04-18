import { areTwoMinElapsedFromLastActivity } from "../actions/sessionRefreshActions";
import { logoutFailure, logoutSuccess } from "../../../common/store/actions";
import {
  automaticSessionRefreshInitialState,
  AutomaticSessionRefreshState,
  testableAutomaticSessionRefreshReducer
} from "../reducers/sessionRefreshReducer";
import { setSecurityAdviceReadyToShow } from "../actions/securityAdviceActions";

describe("AutomaticSessionRefreshReducer", () => {
  if (!testableAutomaticSessionRefreshReducer) {
    throw new Error(
      "AutomaticSessionRefreshReducer is not available in test environment"
    );
  }
  const AutomaticSessionRefreshReducer =
    testableAutomaticSessionRefreshReducer.AutomaticSessionRefreshReducer;

  it("should return initial state by default", () => {
    const state = AutomaticSessionRefreshReducer(
      undefined,
      setSecurityAdviceReadyToShow(false) // random action to trigger the default
    );
    expect(state).toEqual(automaticSessionRefreshInitialState);
  });

  it("should reset on logoutSuccess", () => {
    const state: AutomaticSessionRefreshState = {
      areAlreadyTwoMinAfterLastActivity: true
    };
    const newState = AutomaticSessionRefreshReducer(state, logoutSuccess());
    expect(newState).toEqual(automaticSessionRefreshInitialState);
  });

  it("should reset on logoutFailure", () => {
    const state: AutomaticSessionRefreshState = {
      areAlreadyTwoMinAfterLastActivity: true
    };
    const newState = AutomaticSessionRefreshReducer(
      state,
      logoutFailure({ error: new Error("fail") })
    );
    expect(newState).toEqual(automaticSessionRefreshInitialState);
  });

  it("should update areAlreadyTwoMinAfterLastActivity to true", () => {
    const state = AutomaticSessionRefreshReducer(
      automaticSessionRefreshInitialState,
      areTwoMinElapsedFromLastActivity({ hasTwoMinPassed: true })
    );
    expect(state.areAlreadyTwoMinAfterLastActivity).toBe(true);
  });

  it("should update areAlreadyTwoMinAfterLastActivity to false", () => {
    const currentState: AutomaticSessionRefreshState = {
      areAlreadyTwoMinAfterLastActivity: true
    };
    const state = AutomaticSessionRefreshReducer(
      currentState,
      areTwoMinElapsedFromLastActivity({ hasTwoMinPassed: false })
    );
    expect(state.areAlreadyTwoMinAfterLastActivity).toBe(false);
  });
});
