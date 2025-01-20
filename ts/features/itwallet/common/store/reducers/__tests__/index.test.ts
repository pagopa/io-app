import { applicationChangeState } from "../../../../../../store/actions/application";
import { logoutSuccess } from "../../../../../../store/actions/authentication";
import { createRootReducer } from "../../../../../../store/reducers";
import { itwCredentialsInitialState } from "../../../../credentials/store/reducers";
import { itwIssuanceInitialState } from "../../../../issuance/store/reducers";
import { itwWalletInstanceInitialState } from "../../../../walletInstance/store/reducers";
import { itwLifecycleInitialState } from "../../../../lifecycle/store/reducers";
import itWalletReducer from "../index";
import { itwPreferencesInitialState } from "../preferences";

describe("itWalletReducer", () => {
  it("should match snapshot [if this test fails, remember to add a migration to the store before updating the snapshot]", () => {
    const itWalletState = itWalletReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(itWalletState).toMatchSnapshot();
  });
  it("should persist after a logout action", () => {
    const newState = createRootReducer([])(undefined, logoutSuccess());

    expect(newState.features.itWallet).toEqual({
      issuance: itwIssuanceInitialState,
      lifecycle: itwLifecycleInitialState,
      credentials: itwCredentialsInitialState,
      walletInstance: itwWalletInstanceInitialState,
      preferences: itwPreferencesInitialState
    });
  });
});
