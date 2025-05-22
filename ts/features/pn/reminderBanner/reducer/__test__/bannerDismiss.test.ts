jest.mock("../../../../../store/reducers/backendStatus/remoteConfig");
jest.mock("../../../../services/details/store/reducers");

import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { PersistPartial, PersistedState } from "redux-persist";
import { applicationChangeState } from "../../../../../store/actions/application";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";
import * as remoteConfig from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { SessionToken } from "../../../../../types/SessionToken";
import {
  loginSuccess,
  logoutSuccess
} from "../../../../authentication/common/store/actions";
import * as serviceDetails from "../../../../services/details/store/reducers";
import { dismissPnActivationReminderBanner } from "../../../store/actions";
import * as bannerDismiss from "../bannerDismiss";

const mockIsPnRemoteEnabledSelector = jest.fn();
const mockPnMessagingServiceIdSelector = jest.fn();
const mockServicePreferenceByChannelPotSelector = jest.fn();

(remoteConfig.isPnRemoteEnabledSelector as jest.Mock) =
  mockIsPnRemoteEnabledSelector;
(remoteConfig.pnMessagingServiceIdSelector as jest.Mock) =
  mockPnMessagingServiceIdSelector;
(serviceDetails.servicePreferenceByChannelPotSelector as jest.Mock) =
  mockServicePreferenceByChannelPotSelector;

type PnBannerDismissState = bannerDismiss.PnBannerDismissState & PersistPartial;

const nonDimsissedState: PnBannerDismissState = {
  dismissed: false,
  _persist: {
    version: -1,
    rehydrated: false
  }
};

const { persistedPnBannerDismissReducer, testable } = bannerDismiss;

describe("persistedPnBannerDismissReducer", () => {
  describe("migrations", () => {
    it("should match the expected persistance version, and not have any higher-version migrations", () => {
      const expectedVersion = testable!.CURRENT_STORE_VERSION;
      expect(expectedVersion).toBe(0);
      expect(testable!.migrations[expectedVersion + 1]).toBeUndefined();
    });

    it("should correctly apply the first migration", () => {
      const state = {
        dismissed: true,
        _persist: {
          version: -1,
          rehydrated: false
        }
      } as PersistedState;

      const firstMigration = testable!.migrations[0];
      expect(firstMigration).toBeDefined();
      const migratedState = firstMigration(state);
      expect(migratedState).toEqual({
        ...state,
        dismissed: false
      });
    });
  });

  it("should match snapshot [if this test fails, remember to add a migration to the store before updating the snapshot]", () => {
    const state = persistedPnBannerDismissReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(state).toMatchSnapshot();
  });

  it("should correctly dismiss on dismiss action", () => {
    const action = dismissPnActivationReminderBanner();
    const state = persistedPnBannerDismissReducer(nonDimsissedState, action);
    expect(state.dismissed).toEqual(true);
  });

  it("should not change state for unhandled action types", () => {
    const action = { type: "SOME_OTHER_ACTION" };
    // @ts-expect-error: action type is not supported
    const state = persistedPnBannerDismissReducer(nonDimsissedState, action);
    expect(state).toEqual(nonDimsissedState);
  });
  const testCases = [true, false]
    .map(isSameUser =>
      [true, false].map(hasBeenDismissed => ({
        isSameUser,
        hasBeenDismissed,
        result: isSameUser ? hasBeenDismissed : false
      }))
    )
    .flat();

  testCases.forEach(({ isSameUser, hasBeenDismissed, result }) => {
    it(`should ${
      isSameUser ? "not " : ""
    }reset state on login, after the banner has ${
      hasBeenDismissed ? "" : "not "
    }been dismissed`, () => {
      const store = createStore(persistedPnBannerDismissReducer);
      if (hasBeenDismissed) {
        store.dispatch(dismissPnActivationReminderBanner());
      }
      expect(store.getState()).toEqual({ dismissed: hasBeenDismissed });

      store.dispatch(logoutSuccess());

      store.dispatch(
        loginSuccess({
          token: "" as SessionToken,
          idp: "test"
        })
      );

      if (!isSameUser) {
        store.dispatch(differentProfileLoggedIn());
      }

      expect(store.getState()).toEqual({ dismissed: result });
    });
  });
});

describe("isPnActivationReminderBannerRenderableSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPnMessagingServiceIdSelector.mockReturnValue("pn-service-id");
  });

  const testCases = [true, false]
    .map(hasBeenDismissed =>
      [true, false].map(isRemoteEnabled =>
        [true, false].map(isInboxEnabled => ({
          hasBeenDismissed,
          isRemoteEnabled,
          isInboxEnabled,
          result: isRemoteEnabled && !hasBeenDismissed && !isInboxEnabled
        }))
      )
    )
    .flat()
    .flat();

  test.each(testCases)(
    "handles the following case: %p",
    ({ hasBeenDismissed, isRemoteEnabled, isInboxEnabled, result }) => {
      mockIsPnRemoteEnabledSelector.mockReturnValue(isRemoteEnabled);

      mockServicePreferenceByChannelPotSelector.mockReturnValue(
        pot.some(isInboxEnabled)
      );

      const state = {
        features: {
          pn: {
            bannerDismiss: {
              ...nonDimsissedState,
              dismissed: hasBeenDismissed
            }
          }
        }
      } as GlobalState;

      expect(
        bannerDismiss.isPnActivationReminderBannerRenderableSelector(state)
      ).toBe(result);
      expect(mockIsPnRemoteEnabledSelector).toHaveBeenCalledWith(state);
      expect(mockPnMessagingServiceIdSelector).toHaveBeenCalledWith(state);
      expect(mockServicePreferenceByChannelPotSelector).toHaveBeenCalledWith(
        state,
        "pn-service-id",
        "inbox"
      );
    }
  );

  it("should handle an error state for isPnInboxEnabled, treating it as 'false' ", () => {
    mockIsPnRemoteEnabledSelector.mockReturnValue(true);

    mockServicePreferenceByChannelPotSelector.mockReturnValue(pot.noneError);

    const state = {
      features: {
        pn: {
          bannerDismiss: {
            ...nonDimsissedState
          }
        }
      }
    } as GlobalState;

    expect(
      bannerDismiss.isPnActivationReminderBannerRenderableSelector(state)
    ).toBe(true);
    expect(mockIsPnRemoteEnabledSelector).toHaveBeenCalledWith(state);
    expect(mockPnMessagingServiceIdSelector).toHaveBeenCalledWith(state);
    expect(mockServicePreferenceByChannelPotSelector).toHaveBeenCalledWith(
      state,
      "pn-service-id",
      "inbox"
    );
  });
});
