import { createStore } from "redux";
import { PersistPartial } from "redux-persist";
import { applicationChangeState } from "../../../../../store/actions/application";
import {
  logoutFailure,
  logoutSuccess
} from "../../../../../features/identification/common/store/actions";
import { isPnEnabledSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { dismissPnActivationReminderBanner } from "../../../store/actions";
import {
  PnBannerDismissState as ReducerState,
  isPnActivationReminderBannerRenderableSelector,
  persistedPnBannerDismissReducer
} from "../bannerDismiss";

// Mock the isPnEnabledSelector
jest.mock("../../../../../store/reducers/backendStatus/remoteConfig", () => ({
  isPnEnabledSelector: jest.fn()
}));

type PnBannerDismissState = ReducerState & PersistPartial;
const initialState: PnBannerDismissState = {
  dismissed: false,
  _persist: {
    version: -1,
    rehydrated: false
  }
};

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
    const state = persistedPnBannerDismissReducer(initialState, action);
    expect(state.dismissed).toEqual(true);
  });

  it("should not change state for unhandled action types", () => {
    const action = { type: "SOME_OTHER_ACTION" };
    // @ts-expect-error: action type is not supported
    const state = persistedPnBannerDismissReducer(initialState, action);
    expect(state).toEqual(initialState);
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
  const mockIsPnEnabledSelector = isPnEnabledSelector as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when PN is enabled and banner hasn't been dismissed", () => {
    mockIsPnEnabledSelector.mockReturnValue(true);

    const state = {
      features: {
        pn: {
          bannerDismiss: {
            ...initialState
          }
        }
      }
    } as GlobalState;

    expect(isPnActivationReminderBannerRenderableSelector(state)).toBe(true);
    expect(mockIsPnEnabledSelector).toHaveBeenCalledWith(state);
  });

  it("should return false when PN is enabled but banner has been dismissed", () => {
    mockIsPnEnabledSelector.mockReturnValue(true);

    const state = {
      features: {
        pn: {
          bannerDismiss: {
            ...initialState,
            dismissed: true
          }
        }
      }
    } as GlobalState;

    expect(isPnActivationReminderBannerRenderableSelector(state)).toBe(false);
  });

  it("should return false when PN is disabled and banner hasn't been dismissed", () => {
    mockIsPnEnabledSelector.mockReturnValue(false);

    const state = {
      features: {
        pn: {
          bannerDismiss: {
            ...initialState
          }
        }
      }
    } as GlobalState;

    expect(isPnActivationReminderBannerRenderableSelector(state)).toBe(false);
  });

  it("should return false when PN is disabled and banner has been dismissed", () => {
    mockIsPnEnabledSelector.mockReturnValue(false);

    const state = {
      features: {
        pn: {
          bannerDismiss: {
            ...initialState,
            dismissed: true
          }
        }
      }
    } as unknown as GlobalState;

    expect(isPnActivationReminderBannerRenderableSelector(state)).toBe(false);
  });
});
