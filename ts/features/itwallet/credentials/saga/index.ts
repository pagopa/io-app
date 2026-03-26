import { SagaIterator } from "redux-saga";
import { takeLeading } from "typed-redux-saga/macro";
import {
  itwCredentialsRemoveByType,
  itwCredentialsReplaceByType,
  itwCredentialsStore,
  itwCredentialsStoreBundle
} from "../store/actions";
import { handleItwCredentialsRemoveByTypeSaga } from "./handleItwCredentialsRemoveByTypeSaga";
import { handleItwCredentialsReplaceByTypeSaga } from "./handleItwCredentialsReplaceByTypeSaga";
import { handleItwCredentialsStoreSaga } from "./handleItwCredentialsStoreSaga";
import { handleItwCredentialsStoreBundleSaga } from "./handleItwCredentialsStoreBundleSaga";

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
}
