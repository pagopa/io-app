import { pipe } from "fp-ts/lib/function";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { itwStoreIntegrityKeyTag } from "../../../../issuance/store/actions";
import {
  itwLifecycleIsInstalledSelector,
  itwLifecycleIsOperationalSelector,
  itwLifecycleIsValidSelector
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { Action } from "../../../../../../store/actions/types";
import { itwCredentialsStore } from "../../../../credentials/store/actions";
import { StoredCredential } from "../../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";

const curriedAppReducer =
  (action: Action) => (state: GlobalState | undefined) =>
    appReducer(state, action);

describe("IT Wallet lifecycle selectors", () => {
  it("Correctly defines the INSTALLED state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(true);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(false);
  });

  it("Correctly defines the OPERATIONAL state", () => {
    const globalState = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(
        itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3")
      )
    );

    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(true);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(false);
  });

  it("Correctly defines the VALID state", () => {
    const globalState = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(
        itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3")
      ),
      curriedAppReducer(
        itwCredentialsStore([
          { credentialType: CredentialType.PID }
        ] as Array<StoredCredential>)
      )
    );

    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(true);
  });
});
