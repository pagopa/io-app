import { GlobalState } from "../types";
import { appReducer } from "../index";
import preferencesReducer, {
  initialPreferencesState,
  isExperimentalDesignEnabledSelector,
  isMixpanelEnabled
} from "../persistedPreferences";
import { applicationChangeState } from "../../actions/application";
import { setMixpanelEnabled } from "../../actions/mixpanel";
import {
  logoutRequest,
  logoutSuccess,
  sessionExpired,
  sessionInvalid
} from "../../../features/authentication/common/store/actions";
import { differentProfileLoggedIn } from "../../actions/crossSessions";
import { clearCache } from "../../../features/settings/common/store/actions";
import { preferencesExperimentalDesignEnabled } from "../../actions/persistedPreferences";

describe("persistedPreferences", () => {
  describe("isExperimentalDesignEnabledSelector", () => {
    [false, true].forEach(value =>
      it(`should return '${value}' when 'persistedPreferences.isExperimentalDesignEnabled' is '${value}'`, () => {
        const state = {
          persistedPreferences: {
            isExperimentalDesignEnabled: value
          }
        } as GlobalState;
        const isExperimentalDesignEnabled =
          isExperimentalDesignEnabledSelector(state);
        expect(isExperimentalDesignEnabled).toBe(value);
      })
    );
  });
  describe("isMixpanelEnabled", () => {
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
        logoutRequest({ withApiCall: true }),
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
  describe("preferencesReducer", () => {
    it("should return the initial state", () => {
      const initialState = preferencesReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(initialState).toEqual(initialPreferencesState);
    });
    [false, true].forEach(value =>
      it(`should set 'isExperimentalDesignEnabled' to '${value}' upon receiving action 'preferencesExperimentalDesignEnabled' set to '${value}'`, () => {
        const state = preferencesReducer(
          undefined,
          preferencesExperimentalDesignEnabled({
            isExperimentalDesignEnabled: value
          })
        );
        expect(state.isExperimentalDesignEnabled).toBe(value);
      })
    );
  });
});
