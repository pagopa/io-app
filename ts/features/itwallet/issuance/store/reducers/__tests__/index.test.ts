import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwLifecycleReducersReset } from "../../../../lifecycle/store/actions";
import {
  itwRemoveIntegrityKeyTag,
  itwStoreIntegrityKeyTag
} from "../../actions";

const curriedAppReducer =
  (action: Action) => (state: GlobalState | undefined) =>
    appReducer(state, action);

describe("ITW issuance reducer", () => {
  it("should add the integrity key tag", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(
        itwStoreIntegrityKeyTag("7408c9b7-5f23-4ca6-8960-58305cff5b7e")
      )
    );

    expect(targetSate.features.itWallet.issuance.integrityKeyTag).toEqual(
      O.some("7408c9b7-5f23-4ca6-8960-58305cff5b7e")
    );
  });

  it("should remove the integrity key tag", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(
        itwStoreIntegrityKeyTag("7408c9b7-5f23-4ca6-8960-58305cff5b7e")
      ),
      curriedAppReducer(itwRemoveIntegrityKeyTag())
    );

    expect(targetSate.features.itWallet.issuance.integrityKeyTag).toEqual(
      O.none
    );
  });

  it("should reset the state", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(
        itwStoreIntegrityKeyTag("7408c9b7-5f23-4ca6-8960-58305cff5b7e")
      ),
      curriedAppReducer(itwLifecycleReducersReset())
    );

    expect(targetSate.features.itWallet.issuance.integrityKeyTag).toEqual(
      O.none
    );
  });
});
