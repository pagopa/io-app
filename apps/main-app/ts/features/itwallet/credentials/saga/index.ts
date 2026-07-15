import { SagaIterator } from "redux-saga";
import { takeLeading } from "typed-redux-saga/macro";

import {
  itwCredentialsRefreshStatusByType,
  itwCredentialsRemoveByType,
  itwCredentialsReplaceByType,
  itwCredentialsStore,
  itwCredentialsStoreBundle
} from "../store/actions";
import { handleCredentialStatusAssertionRetry } from "./checkCredentialsStatusAssertion";
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
}
