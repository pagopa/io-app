import { SagaIterator } from "redux-saga";
import { takeLeading } from "typed-redux-saga/macro";

import {
  itwCredentialsBatchRefillRequest,
  itwCredentialsConsumeInstance,
  itwCredentialsRefreshStatusByType,
  itwCredentialsRemoveByType,
  itwCredentialsReplaceByType,
  itwCredentialsStore,
  itwCredentialsStoreBundle
} from "../store/actions";
import { handleCredentialStatusAssertionRetry } from "./checkCredentialsStatusAssertion";
import { handleItwCredentialsBatchRefillSaga } from "./handleItwCredentialsBatchRefillSaga";
import { handleItwCredentialsConsumeInstanceSaga } from "./handleItwCredentialsConsumeInstanceSaga";
import { handleItwCredentialsRemoveByTypeSaga } from "./handleItwCredentialsRemoveByTypeSaga";
import { handleItwCredentialsReplaceByTypeSaga } from "./handleItwCredentialsReplaceByTypeSaga";
import { handleItwCredentialsStoreBundleSaga } from "./handleItwCredentialsStoreBundleSaga";
import { handleItwCredentialsStoreSaga } from "./handleItwCredentialsStoreSaga";

export function* watchItwCredentialsSaga(): SagaIterator {
  yield* takeLeading(
    itwCredentialsStoreBundle,
    handleItwCredentialsStoreBundleSaga
  );
  yield* takeLeading(itwCredentialsStore, handleItwCredentialsStoreSaga);
  yield* takeLeading(
    itwCredentialsRemoveByType,
    handleItwCredentialsRemoveByTypeSaga
  );
  yield* takeLeading(
    itwCredentialsReplaceByType,
    handleItwCredentialsReplaceByTypeSaga
  );
  yield* takeLeading(
    itwCredentialsRefreshStatusByType,
    handleCredentialStatusAssertionRetry
  );
  yield* takeLeading(
    itwCredentialsConsumeInstance,
    handleItwCredentialsConsumeInstanceSaga
  );
  // `takeLeading` avoids concurrent renewals when the two triggers fire close to each other.
  // Proof of Age is the only batch credential, so dropping other types meanwhile is harmless.
  yield* takeLeading(
    itwCredentialsBatchRefillRequest,
    handleItwCredentialsBatchRefillSaga
  );
}
