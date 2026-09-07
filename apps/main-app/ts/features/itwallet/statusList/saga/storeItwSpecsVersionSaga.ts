import { type ItwVersion } from "@pagopa/io-react-native-wallet";
import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "typed-redux-saga/macro";
import { Action, isActionOf } from "typesafe-actions";

import { CredentialType } from "../../common/utils/itwMocksUtils";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { storeItwSpecsVersion } from "../utils/storage";

/**
 * Matches credential store actions containing an eID.
 */
export const isItwCredentialsStoreWithEid = (
  action: Action
): action is ReturnType<typeof itwCredentialsStore> =>
  isActionOf(itwCredentialsStore, action) &&
  action.payload.some(
    credential => credential.credentialType === CredentialType.PID
  );

/**
 * Persists the specs version carried by the stored eID.
 * Storage failures are ignored because this background-task projection must not
 * affect credential storage.
 */
export function* handleItwSpecsVersionStorageSaga(
  action: ReturnType<typeof itwCredentialsStore>
): SagaIterator {
  const eid = action.payload.find(
    credential => credential.credentialType === CredentialType.PID
  ) as (typeof action.payload)[number];

  try {
    yield* call(storeItwSpecsVersion, eid.spec_version as ItwVersion);
  } catch {
    // Credential storage remains authoritative; registration retries the projection.
  }
}

/**
 * Keeps the background-task specs version synchronized with the latest eID.
 */
export function* watchItwSpecsVersionStorageSaga(): SagaIterator {
  yield* takeLatest(
    isItwCredentialsStoreWithEid,
    handleItwSpecsVersionStorageSaga
  );
}
