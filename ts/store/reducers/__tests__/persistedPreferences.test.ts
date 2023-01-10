import { GlobalState } from "../types";
import { appReducer } from "../index";
import { isMixpanelEnabled } from "../persistedPreferences";
import { applicationChangeState } from "../../actions/application";
import { setMixpanelEnabled } from "../../actions/mixpanel";
import {
  logoutRequest,
  logoutSuccess,
  sessionExpired,
  sessionInvalid
} from "../../actions/authentication";
import { differentProfileLoggedIn } from "../../actions/crossSessions";
import { clearCache } from "../../actions/profile";

describe("persistedPreferences reducer/selectors", () => {
  it("should be reset mixpanel preference only on differentProfileLoggedIn action ", () => {
    const initialState: GlobalState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(isMixpanelEnabled(initialState)).toBeNull();

    const enabledState: GlobalState = appReducer(
      initialState,
      setMixpanelEnabled(true)
    );
    expect(isMixpanelEnabled(enabledState)).toBeTruthy();

    const notEnabledState: GlobalState = appReducer(
      enabledState,
      setMixpanelEnabled(false)
    );
    expect(isMixpanelEnabled(notEnabledState)).toBeFalsy();

    // eslint-disable-next-line functional/no-let
    let noChangesState: GlobalState = notEnabledState;
    // for these actions isMixpanelEnabled must not change
    [
      logoutRequest(),
      logoutSuccess(),
      sessionExpired(),
      sessionInvalid(),
      clearCache()
    ].forEach(action => {
      noChangesState = appReducer(noChangesState, action);
      // it has to match the last set value
      expect(isMixpanelEnabled(notEnabledState)).toBeFalsy();
    });

    const resetState: GlobalState = appReducer(
      noChangesState,
      differentProfileLoggedIn()
    );
    expect(isMixpanelEnabled(resetState)).toBeNull();
  });
});
