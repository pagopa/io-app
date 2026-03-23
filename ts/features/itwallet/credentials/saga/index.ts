import { SagaIterator } from "redux-saga";
import { takeLeading, takeLatest } from "typed-redux-saga/macro";
import {
  itwCredentialsRemoveByType,
  itwCredentialsStore,
  itwCredentialsRefreshStatusByType
} from "../store/actions";
import { handleItwCredentialsRemoveSaga } from "./handleItwCredentialsRemoveSaga";
import { handleItwCredentialsStoreSaga } from "./handleItwCredentialsStoreSaga";
import { handleCredentialStatusAssertionRetry } from "./checkCredentialsStatusAssertion";

export function* watchItwCredentialsSaga(): SagaIterator {
  yield* takeLeading(itwCredentialsStore, handleItwCredentialsStoreSaga);
  yield* takeLeading(
    itwCredentialsRemoveByType,
    handleItwCredentialsRemoveSaga
  );
  yield* takeLatest(
    itwCredentialsRefreshStatusByType,
    handleCredentialStatusAssertionRetry
  );
}
