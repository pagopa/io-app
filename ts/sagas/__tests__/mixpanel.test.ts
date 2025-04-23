import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { CommonActions, StackActions } from "@react-navigation/native";
import {
  identifyMixpanelSaga,
  watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel,
  resetMixpanelSaga,
  initMixpanel,
  handleSetMixpanelEnabled,
  askMixpanelOptIn,
  testable
} from "../mixpanel";
import {
  sessionExpired,
  sessionInvalid
} from "../../features/authentication/common/store/actions";
import {
  identifyMixpanel,
  initializeMixPanel,
  resetMixpanel,
  terminateMixpanel
} from "../../mixpanel";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { updateMixpanelProfileProperties } from "../../mixpanelConfig/profileProperties";
import { setIsMixpanelInitialized } from "../../features/mixpanel/store/actions";

describe("mixpanel", () => {
  describe("watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel", () => {
    it("should follow expected flow", () => {
      testSaga(watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel)
        .next()
        .takeLatest(
          [getType(sessionExpired), getType(sessionInvalid)],
          resetMixpanel
        )
        .next()
        .isDone();
    });
  });

  describe("identifyMixpanelSaga", () => {
    it("should call identifyMixpanel", () => {
      testSaga(identifyMixpanelSaga)
        .next()
        .call(identifyMixpanel)
        .next()
        .isDone();
    });
  });

  describe("resetMixpanelSaga", () => {
    it("should call resetMixpanel", () => {
      testSaga(resetMixpanelSaga).next().call(resetMixpanel).next().isDone();
    });
  });

  describe("initMixpanel", () => {
    it("should initialize mixpanel when mixpanel is enabled", () => {
      testSaga(initMixpanel)
        .next()
        .select(isMixpanelEnabled)
        .next(true)
        .call(testable!.initializeMixpanelAndUpdateState ?? initializeMixPanel)
        .next()
        .isDone();
    });

    it("should initialize mixpanel when mixpanel preference is null (defaulting to true)", () => {
      testSaga(initMixpanel)
        .next()
        .select(isMixpanelEnabled)
        .next(null)
        .call(testable!.initializeMixpanelAndUpdateState ?? initializeMixPanel)
        .next()
        .isDone();
    });

    it("should not initialize mixpanel when mixpanel is disabled", () => {
      testSaga(initMixpanel)
        .next()
        .select(isMixpanelEnabled)
        .next(false)
        .isDone();
    });
  });

  describe("handleSetMixpanelEnabled", () => {
    it("should initialize mixpanel and identify user when enabled", () => {
      const action = setMixpanelEnabled(true);

      testSaga(handleSetMixpanelEnabled, action)
        .next()
        .call(testable!.initializeMixpanelAndUpdateState ?? initializeMixPanel)
        .next()
        .call(identifyMixpanelSaga)
        .next()
        .isDone();
    });

    it("should terminate mixpanel and reset state when disabled", () => {
      const action = setMixpanelEnabled(false);

      testSaga(handleSetMixpanelEnabled, action)
        .next()
        .call(terminateMixpanel)
        .next()
        .put(setIsMixpanelInitialized(false))
        .next()
        .isDone();
    });
  });

  describe("askMixpanelOptIn", () => {
    it("should do nothing when user already opted in", () => {
      testSaga(askMixpanelOptIn)
        .next()
        .select(isMixpanelEnabled)
        .next(true)
        .call(identifyMixpanelSaga)
        .next()
        .isDone();
    });

    it("should do nothing when user already opted out", () => {
      testSaga(askMixpanelOptIn)
        .next()
        .select(isMixpanelEnabled)
        .next(false)
        .isDone();
    });

    it("should navigate to opt-in screen when no preference is set", () => {
      const mockState = { someState: "mockValue" };

      testSaga(askMixpanelOptIn)
        .next()
        .select(isMixpanelEnabled)
        .next(null)
        .call(
          NavigationService.dispatchNavigationAction,
          CommonActions.navigate({
            name: ROUTES.ONBOARDING,
            params: {
              screen: ROUTES.ONBOARDING_SHARE_DATA
            }
          })
        )
        .next()
        .take(setMixpanelEnabled)
        .next()
        .call(
          NavigationService.dispatchNavigationAction,
          StackActions.popToTop()
        )
        .next()
        .select()
        .next(mockState)
        .call(updateMixpanelProfileProperties, mockState)
        .next()
        .isDone();
    });
  });

  describe("initializeMixpanelAndUpdateState", () => {
    it("should initialize mixpanel and update state", () => {
      const mockState = { someState: "mockValue" };

      testSaga(testable!.initializeMixpanelAndUpdateState)
        .next()
        .select()
        .next(mockState)
        .call(initializeMixPanel, mockState)
        .next()
        .put(setIsMixpanelInitialized(true))
        .next()
        .isDone();
    });
  });
});
