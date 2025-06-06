import { GlobalState } from "../types";
import { appReducer } from "../index";
import preferencesReducer, {
  initialPreferencesState,
  isExperimentalDesignEnabledSelector,
  isMessagePaymentInfoV2Selector,
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
import {
  preferencesExperimentalDesignEnabled,
  setUseMessagePaymentInfoV2
} from "../../actions/persistedPreferences";

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
    [false, true].forEach(payload =>
      it(`should set 'useMessagePaymentInfoV2' to '${payload}' after receiving 'setUseMessagePaymentInfoV2(${payload})'`, () => {
        const state = preferencesReducer(
          { ...initialPreferencesState, useMessagePaymentInfoV2: !payload },
          setUseMessagePaymentInfoV2(payload)
        );
        expect(state.useMessagePaymentInfoV2).toBe(payload);
      })
    );
  });
  describe("isMessagePaymentInfoV2Selector", () => {
    [false, true].forEach(data =>
      it(`should return '${data}' when 'useMessagePaymentInfoV2' is '${data}'`, () => {
        const state = appReducer(undefined, setUseMessagePaymentInfoV2(data));
        const useMessagePaymentInfoV2 = isMessagePaymentInfoV2Selector(state);
        expect(useMessagePaymentInfoV2).toBe(data);
      })
    );
  });
});
