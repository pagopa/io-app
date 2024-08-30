import { pipe } from "fp-ts/lib/function";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { itwLifecycleStateUpdated } from "../../actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwLifecycleWalletReset } from "../../../../lifecycle/store/actions";
import { ItwLifecycleState } from "..";

const curriedAppReducer =
  (action: Action) => (state: GlobalState | undefined) =>
    appReducer(state, action);

describe("ITW lifecycle reducer", () => {
  it("should update the wallet instance state", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(
        itwLifecycleStateUpdated(ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL)
      )
    );

    expect(targetSate.features.itWallet.lifecycle).toEqual(
      ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL
    );
  });

  it("should reset the state", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwLifecycleWalletReset())
    );

    expect(targetSate.features.itWallet.lifecycle).toEqual(
      ItwLifecycleState.ITW_LIFECYCLE_INSTALLED
    );
  });
});
