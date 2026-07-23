import { applicationChangeState } from "../../../../../../store/actions/application";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";
import { ItwStoredCredentialsMocks } from "../../../utils/itwMocksUtils";
import {
  itwClearCredentialUpgradeFailed,
  itwClearWalletActivationFeedbackBannerData,
  itwSetAuthLevel,
  itwSetClaimValuesHidden,
  itwSetCredentialUpgradeFailed,
  itwSetIdentificationMode,
  itwSetWalletActivationFeedbackBannerData,
  ItwWalletActivationFeedbackBannerData
} from "../../actions/preferences";
import reducer, {
  itwPreferencesInitialState,
  ItwPreferencesState
} from "../preferences";

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
      isFiscalCodeWhitelisted: true,
      identificationMode: "cieId"
    };

    const expectedState: ItwPreferencesState = {
      ...itwPreferencesInitialState,
      claimValuesHidden: true,
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

  it("should handle itwSetIdentificationMode action", () => {
    const action = itwSetIdentificationMode("cieId");
    const newState = reducer(INITIAL_STATE, action);

    expect(newState).toEqual({
      ...newState,
      identificationMode: "cieId"
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

  it("should override credential upgrade failures", () => {
    const initialFailures = [ItwStoredCredentialsMocks.L3.mdl.credentialType];
    const updatedFailures = [ItwStoredCredentialsMocks.L3.ts.credentialType];

    const stateAfterInitial = reducer(
      INITIAL_STATE,
      itwSetCredentialUpgradeFailed(initialFailures)
    );
    const stateAfterUpdate = reducer(
      stateAfterInitial,
      itwSetCredentialUpgradeFailed(updatedFailures)
    );

    expect(stateAfterUpdate).toEqual({
      ...stateAfterInitial,
      credentialUpgradeFailed: updatedFailures
    });
  });

  it("should remove a credential type from upgrade failures", () => {
    const mdl = ItwStoredCredentialsMocks.L3.mdl.credentialType;
    const ts = ItwStoredCredentialsMocks.L3.ts.credentialType;

    const state = reducer(
      INITIAL_STATE,
      itwSetCredentialUpgradeFailed([mdl, ts])
    );

    const updatedState = reducer(state, itwClearCredentialUpgradeFailed(mdl));

    expect(updatedState.credentialUpgradeFailed).toEqual([ts]);
  });

  it("should persist preferences when the wallet is being reset", () => {
    const action = itwLifecycleStoresReset();
    const newState = reducer(
      {
        isPendingReview: true,
        authLevel: "L2",
        claimValuesHidden: true,
        isItwActivationDisabled: true
      },
      action
    );

    expect(newState).toEqual({
      ...itwPreferencesInitialState,
      claimValuesHidden: true,
      isItwActivationDisabled: true
    });
  });

  describe("itwSetWalletActivationFeedbackBannerData / itwClearWalletActivationFeedbackBannerData", () => {
    const SAMPLE_DATA: ItwWalletActivationFeedbackBannerData = {
      docStatus: "not_active",
      authMethod: "ciepin"
    };

    it("should store banner data", () => {
      const newState = reducer(
        INITIAL_STATE,
        itwSetWalletActivationFeedbackBannerData(SAMPLE_DATA)
      );
      expect(newState.walletActivationFeedbackBannerData).toEqual(SAMPLE_DATA);
    });

    it("should overwrite previously stored banner data", () => {
      const updated: ItwWalletActivationFeedbackBannerData = {
        ...SAMPLE_DATA,
        authMethod: "spid"
      };
      const stateWithData = reducer(
        INITIAL_STATE,
        itwSetWalletActivationFeedbackBannerData(SAMPLE_DATA)
      );
      const stateAfterUpdate = reducer(
        stateWithData,
        itwSetWalletActivationFeedbackBannerData(updated)
      );
      expect(stateAfterUpdate.walletActivationFeedbackBannerData).toEqual(
        updated
      );
    });

    it("should remove banner data", () => {
      const stateWithData = reducer(
        INITIAL_STATE,
        itwSetWalletActivationFeedbackBannerData(SAMPLE_DATA)
      );
      const stateAfterClear = reducer(
        stateWithData,
        itwClearWalletActivationFeedbackBannerData()
      );
      expect(
        stateAfterClear.walletActivationFeedbackBannerData
      ).toBeUndefined();
    });

    it("should preserve other fields when clearing banner data", () => {
      const stateWithData = reducer(
        { ...INITIAL_STATE, authLevel: "L2" },
        itwSetWalletActivationFeedbackBannerData(SAMPLE_DATA)
      );
      const stateAfterClear = reducer(
        stateWithData,
        itwClearWalletActivationFeedbackBannerData()
      );
      expect(stateAfterClear.authLevel).toBe("L2");
      expect(
        stateAfterClear.walletActivationFeedbackBannerData
      ).toBeUndefined();
    });

    it("should clear banner data on itwLifecycleStoresReset", () => {
      const stateWithData = reducer(
        INITIAL_STATE,
        itwSetWalletActivationFeedbackBannerData(SAMPLE_DATA)
      );
      const stateAfterReset = reducer(stateWithData, itwLifecycleStoresReset());
      expect(
        stateAfterReset.walletActivationFeedbackBannerData
      ).toBeUndefined();
    });
  });
});
