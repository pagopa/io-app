import { addMonths } from "date-fns";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  itwCloseDiscoveryBanner,
  itwCloseFeedbackBanner,
  itwFlagCredentialAsRequested,
  itwSetAuthLevel,
  itwSetClaimValuesHidden,
  itwUnflagCredentialAsRequested
} from "../../actions/preferences";
import reducer, {
  itwPreferencesInitialState,
  ItwPreferencesState
} from "../preferences";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";

describe("IT Wallet preferences reducer", () => {
  const INITIAL_STATE: ItwPreferencesState = {
    requestedCredentials: {}
  };

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

  it("should handle itwFlagCredentialAsRequested action", () => {
    const mockDate = "2024-11-14T20:43:21.361Z";
    MockDate.set(mockDate);

    const action = itwFlagCredentialAsRequested("MDL");
    const newState = reducer(INITIAL_STATE, action);

    expect(newState).toEqual({
      ...newState,
      requestedCredentials: {
        MDL: mockDate
      }
    });
    MockDate.reset();
  });

  it("should handle itwRemoveRequestedCredential action", () => {
    const mockDate = "2024-11-14T20:43:21.361Z";
    MockDate.set(mockDate);

    const action = itwUnflagCredentialAsRequested("MDL");
    const newState = reducer(
      {
        ...INITIAL_STATE,
        requestedCredentials: {
          MDL: mockDate
        }
      },
      action
    );

    expect(newState).toEqual({
      ...newState,
      requestedCredentials: {}
    });
    MockDate.reset();
  });

  it("should handle itwLifecycleStoresReset action", () => {
    const action = itwLifecycleStoresReset();
    const newState = reducer(INITIAL_STATE, action);

    expect(newState).toEqual(itwPreferencesInitialState);
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
        requestedCredentials: { MDL: "abcd" },
        isPendingReview: true,
        authLevel: "L2",
        claimValuesHidden: true,
        isWalletInstanceRemotelyActive: true,
        isL3Enabled: true,
        offlineBannerHidden: true,
      },
      action
    );

    expect(newState).toEqual({
      ...itwPreferencesInitialState,
      claimValuesHidden: true,
      isL3Enabled: true
    });
  });

});
