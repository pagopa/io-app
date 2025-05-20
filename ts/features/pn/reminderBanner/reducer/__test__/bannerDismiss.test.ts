jest.mock("../../../../../store/reducers/backendStatus/remoteConfig");
jest.mock("../../../../services/details/store/reducers");

import { createStore } from "redux";
import { PersistPartial } from "redux-persist";
import {
  logoutFailure,
  logoutSuccess
} from "../../../../../features/authentication/common/store/actions";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as remoteConfig from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { dismissPnActivationReminderBanner } from "../../../store/actions";
import * as bannerDismiss from "../bannerDismiss";

const mockIsPnRemoteEnabledSelector = jest.fn();

(remoteConfig.isPnRemoteEnabledSelector as jest.Mock) =
  mockIsPnRemoteEnabledSelector;

type PnBannerDismissState = bannerDismiss.PnBannerDismissState & PersistPartial;
const nonDimsissedState: PnBannerDismissState = {
  dismissed: false,
  _persist: {
    version: -1,
    rehydrated: false
  }
};

const { persistedPnBannerDismissReducer } = bannerDismiss;

describe("persistedPnBannerDismissReducer", () => {
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
  ["success", "failure"].forEach(type => {
    it(`should reset state on logout ${type}`, () => {
      const store = createStore(persistedPnBannerDismissReducer);
      store.dispatch(dismissPnActivationReminderBanner());
      expect(store.getState()).toEqual({ dismissed: true });
      store.dispatch(
        type === "success"
          ? logoutSuccess()
          : logoutFailure({ error: new Error() })
      );
      expect(store.getState()).toEqual({ dismissed: false });
    });
  });
});

describe("isPnActivationReminderBannerRenderableSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testCases = [true, false]
    .map(hasBeenDismissed =>
      [true, false].map(isRemoteEnabled => ({
        hasBeenDismissed,
        isRemoteEnabled,
        result: isRemoteEnabled && !hasBeenDismissed
      }))
    )
    .flat();

  test.each(testCases)(
    "handles the following case: %p",
    ({ hasBeenDismissed, isRemoteEnabled, result }) => {
      mockIsPnRemoteEnabledSelector.mockReturnValue(isRemoteEnabled);

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
    }
  );
});
