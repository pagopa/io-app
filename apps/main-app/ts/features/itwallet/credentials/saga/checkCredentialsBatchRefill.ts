import { put, select } from "typed-redux-saga/macro";

import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { itwCredentialsBatchRefillRequest } from "../store/actions";
import { itwCredentialsToRefillSelector } from "../store/selectors";

/**
 * Boot-time safety net for one-time-use credential batches: renews every pool
 * that is down to its refill threshold, no matter how it got there.
 *
 * It backs up the eager trigger in `handleItwCredentialsConsumeInstanceSaga`:
 * if the app is killed right after a presentation, or the renewal fails because
 * the device is offline, the pool is still under threshold at the next start
 * and gets picked up here.
 */
export function* checkCredentialsBatchRefill() {
  const isWalletValid = yield* select(itwLifecycleIsValidSelector);

  // Credentials can be renewed only when the wallet is valid, i.e. the eID was issued
  if (!isWalletValid) {
    return;
  }

  const credentialTypes = yield* select(itwCredentialsToRefillSelector);

  for (const credentialType of credentialTypes) {
    yield* put(
      itwCredentialsBatchRefillRequest({ credentialType, trigger: "app-start" })
    );
  }
}
