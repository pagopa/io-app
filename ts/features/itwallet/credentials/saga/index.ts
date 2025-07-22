import { SagaIterator } from "redux-saga";
import { takeLeading } from "typed-redux-saga/macro";
import { itwCredentialTypeRemove, itwCredentialsStore } from "../store/actions";
import { handleItwCredentialsRemoveSaga } from "./handleItwCredentialsRemoveSaga";
import { handleItwCredentialsStoreSaga } from "./handleItwCredentialsStoreSaga";

export function* watchItwCredentialsSaga(): SagaIterator {
  yield* takeLeading(itwCredentialsStore, handleItwCredentialsStoreSaga);
  yield* takeLeading(itwCredentialTypeRemove, handleItwCredentialsRemoveSaga);
}
