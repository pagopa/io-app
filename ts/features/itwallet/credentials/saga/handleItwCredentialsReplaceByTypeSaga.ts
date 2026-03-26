import { call } from "typed-redux-saga/macro";
import {
  itwCredentialsRemoveByType,
  itwCredentialsReplaceByType,
  itwCredentialsStoreBundle
} from "../store/actions";
import { handleItwCredentialsRemoveByTypeSaga } from "./handleItwCredentialsRemoveByTypeSaga";
import { handleItwCredentialsStoreBundleSaga } from "./handleItwCredentialsStoreBundleSaga";

/**
 * This saga atomically handles the credential replacement by sequentially
 * calling the remove and store sagas. This avoids the race condition that
 * occurs when dispatching two separate actions that trigger independent sagas.
 */
export function* handleItwCredentialsReplaceByTypeSaga(
  action: ReturnType<typeof itwCredentialsReplaceByType>
) {
  const credentials = action.payload;

  if (credentials.length === 0) {
    return;
  }

  const credentialType = credentials[0].metadata.credentialType;

  // Remove first, then store — sequential execution, no race condition
  yield* call(
    handleItwCredentialsRemoveByTypeSaga,
    itwCredentialsRemoveByType(credentialType)
  );
  yield* call(
    handleItwCredentialsStoreBundleSaga,
    itwCredentialsStoreBundle(credentials)
  );
}
