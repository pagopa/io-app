import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { ItwLifecycleState } from "../../reducers";
import { itwLifecycleStateUpdated } from "../../actions";
import { itwStoreIntegrityKeyTag } from "../../../../issuance/store/actions";
import {
  itwLifecycleIsInstalledSelector,
  itwLifecycleIsOperationalSelector
} from "..";

describe("IT Wallet lifecycle selectors", () => {
  it("Correctly defines the INSTALLED state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(true);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
  });

  it("Correctly defines the OPERATIONAL state", () => {
    const initialState = appReducer(
      undefined,
      applicationChangeState("active")
    );

    const globalState = appReducer(
      appReducer(
        initialState,
        itwLifecycleStateUpdated(ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL)
      ),
      itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3")
    );

    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(true);
  });
});
