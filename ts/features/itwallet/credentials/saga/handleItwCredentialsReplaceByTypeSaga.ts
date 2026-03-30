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
  const { onComplete, onError } = action.meta;

  if (credentials.length === 0) {
    return;
  }

  const credentialType = credentials[0].metadata.credentialType;

  // Remove first, then store — sequential execution, no race condition
  yield* call(
    handleItwCredentialsRemoveByTypeSaga,
    itwCredentialsRemoveByType(credentialType, { onError })
  );
  yield* call(
    handleItwCredentialsStoreBundleSaga,
    itwCredentialsStoreBundle(credentials, { onError })
  );

  onComplete?.();
}
