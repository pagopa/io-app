import { pipe } from "fp-ts/lib/function";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwLifecycleIntegrityServiceReady,
  itwLifecycleStateUpdated
} from "../../actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";
import { ItwLifecycleStatus } from "..";

const curriedAppReducer =
  (action: Action) => (state: GlobalState | undefined) =>
    appReducer(state, action);

describe("ITW lifecycle reducer", () => {
  it("should update the wallet instance state", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(
        itwLifecycleStateUpdated({
          status: ItwLifecycleStatus.ITW_LIFECYCLE_OPERATIONAL
        })
      )
    );

    expect(targetSate.features.itWallet.lifecycle.status).toEqual(
      ItwLifecycleStatus.ITW_LIFECYCLE_OPERATIONAL
    );
  });

  it("should reset the state", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwLifecycleStoresReset())
    );

    expect(targetSate.features.itWallet.lifecycle.status).toEqual(
      ItwLifecycleStatus.ITW_LIFECYCLE_INSTALLED
    );
  });

  it("should update the integrityServiceReady flag", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(itwLifecycleIntegrityServiceReady(true))
    );

    expect(
      targetSate.features.itWallet.lifecycle.integrityServiceReady
    ).toEqual(true);
  });
});
