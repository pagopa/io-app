import semver from "semver";
import { take } from "typed-redux-saga/macro";
import { Action, isActionOf } from "typesafe-actions";

import { itwCredentialsStore } from "../../credentials/store/actions";
import { CredentialType } from "../utils/itwMocksUtils";

const MIN_ITW_SPECS_VERSION = "1.3.3";

/**
 * Waits for a credential store action containing an IT Wallet PID issued with
 * specs version 1.3.3 or later, which signals wallet activation.
 */
export function* waitForItWalletActivation() {
  yield* take(
    (action: Action): action is ReturnType<typeof itwCredentialsStore> =>
      isActionOf(itwCredentialsStore, action) &&
      action.payload.find(cred => {
        if (cred.credentialType !== CredentialType.PID) {
          // Credential is not a PID, skip
          return false;
        }

        const specVersion = semver.valid(cred.spec_version);
        if (specVersion === null) {
          // Invalid spec version, skip
          return false;
        }
        return semver.gte(specVersion, MIN_ITW_SPECS_VERSION);
      }) !== undefined
  );
}
