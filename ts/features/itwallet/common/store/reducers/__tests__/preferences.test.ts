import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  itwSetAuthLevel,
  itwSetClaimValuesHidden
} from "../../actions/preferences";
import reducer, {
  itwPreferencesInitialState,
  ItwPreferencesState
} from "../preferences";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";

describe("IT Wallet preferences reducer", () => {
  const INITIAL_STATE: ItwPreferencesState = {};

  it("should return the initial state", () => {
    expect(reducer(undefined, applicationChangeState("active"))).toEqual(
      INITIAL_STATE
    );
  });

  it("should handle itwLifecycleStoresReset action and ensure some values are not reset", () => {
    const initialState: ItwPreferencesState = {
      isPendingReview: true,
      authLevel: "L2",
      claimValuesHidden: true,
      isWalletInstanceRemotelyActive: true,
      isFiscalCodeWhitelisted: true
    };

    const expectedState: ItwPreferencesState = {
      ...itwPreferencesInitialState,
      claimValuesHidden: true,
      isWalletInstanceRemotelyActive: true,
      isFiscalCodeWhitelisted: true
    };

    const action = itwLifecycleStoresReset();
    const newState = reducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  it("should handle itwSetAuthLevel action", () => {
    const action = itwSetAuthLevel("L2");
    const newState = reducer(INITIAL_STATE, action);

    expect(newState).toEqual({
      ...newState,
      authLevel: "L2"
    });
  });

  it("should handle itwSetClaimValuesHidden action", () => {
    const action = itwSetClaimValuesHidden(true);
    const newState = reducer(INITIAL_STATE, action);

    expect(newState).toEqual({
      ...newState,
      claimValuesHidden: true
    });
  });

  it("should persist preferences when the wallet is being reset", () => {
    const action = itwLifecycleStoresReset();
    const newState = reducer(
      {
        isPendingReview: true,
        authLevel: "L2",
        claimValuesHidden: true,
        isWalletInstanceRemotelyActive: true,
        isItwActivationDisabled: true
      },
      action
    );

    expect(newState).toEqual({
      ...itwPreferencesInitialState,
      claimValuesHidden: true,
      isWalletInstanceRemotelyActive: true,
      isItwActivationDisabled: true
    });
  });
});
