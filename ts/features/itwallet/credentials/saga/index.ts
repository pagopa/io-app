import { SagaIterator } from "redux-saga";
import { takeLeading } from "typed-redux-saga/macro";

import {
  itwCredentialsRefreshStatusByType,
  itwCredentialsRemoveByType,
  itwCredentialsStore
} from "../store/actions";
import { handleCredentialStatusAssertionRetry } from "./checkCredentialsStatusAssertion";
import { handleItwCredentialsRemoveSaga } from "./handleItwCredentialsRemoveSaga";
import { handleItwCredentialsStoreSaga } from "./handleItwCredentialsStoreSaga";

export function* watchItwCredentialsSaga(): SagaIterator {
  yield* takeLeading(itwCredentialsStore, handleItwCredentialsStoreSaga);
  yield* takeLeading(
    itwCredentialsRemoveByType,
    handleItwCredentialsRemoveSaga
  );
  yield* takeLeading(
    itwCredentialsRefreshStatusByType,
    handleCredentialStatusAssertionRetry
  );
}
