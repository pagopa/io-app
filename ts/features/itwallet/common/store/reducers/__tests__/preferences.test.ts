import { addMonths } from "date-fns";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  itwCloseDiscoveryBanner,
  itwCloseFeedbackBanner,
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

  it("should handle itwCloseFeedbackBanner action", () => {
    const mockDate = "2024-11-14T20:43:21.361Z";
    MockDate.set(mockDate);

    const expectedDate = addMonths(mockDate, 1);
    const action = itwCloseFeedbackBanner();
    const newState = reducer(INITIAL_STATE, action);

    expect(newState).toEqual({
      ...newState,
      hideFeedbackBannerUntilDate: expectedDate.toISOString()
    });
    MockDate.reset();
  });

  it("should handle itwCloseDiscoveryBanner action", () => {
    const mockDate = "2024-11-14T20:43:21.361Z";
    MockDate.set(mockDate);

    const expectedDate = addMonths(mockDate, 6);
    const action = itwCloseDiscoveryBanner();
    const newState = reducer(INITIAL_STATE, action);

    expect(newState).toEqual({
      ...newState,
      hideDiscoveryBannerUntilDate: expectedDate.toISOString()
    });
    MockDate.reset();
  });

  it("should handle itwLifecycleStoresReset action and ensure some values are not reset", () => {
    const initialState: ItwPreferencesState = {
      hideFeedbackBannerUntilDate: "2024-11-14T20:43:21.361Z",
      hideDiscoveryBannerUntilDate: "2024-11-14T20:43:21.361Z",
      isPendingReview: true,
      authLevel: "L2",
      claimValuesHidden: true,
      isWalletInstanceRemotelyActive: true,
      isFiscalCodeWhitelisted: true,
      walletUpgradeMDLDetailsBannerHidden: true
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
        hideFeedbackBannerUntilDate: "abcd",
        hideDiscoveryBannerUntilDate: "abcd",
        isPendingReview: true,
        authLevel: "L2",
        claimValuesHidden: true,
        isWalletInstanceRemotelyActive: true,
        walletUpgradeMDLDetailsBannerHidden: true
      },
      action
    );

    expect(newState).toEqual({
      ...itwPreferencesInitialState,
      claimValuesHidden: true,
      isWalletInstanceRemotelyActive: true
    });
  });
});
