import { put, select } from "typed-redux-saga/macro";

import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { itwKeyAttestationsRemoveById } from "../../walletInstance/store/actions";
import { itwKeyAttestationsSelector } from "../../walletInstance/store/selectors";
import { itwCredentialsByTypeSelector } from "../store/selectors";

/**
 * Saga that checks for Key Attestations that are not associated
 * with any credential and removes them from the store.
 */
export function* handleKeyAttestationsCleanUp() {
  const allCredentialsByType = yield* select(itwCredentialsByTypeSelector);
  const allCredentials = Object.values(
    allCredentialsByType
  ).flatMap<CredentialMetadata>(Object.values);
  const keyAttestationIds = Object.keys(
    yield* select(itwKeyAttestationsSelector)
  );

  const idsToRemove = keyAttestationIds.filter(
    id => !allCredentials.some(c => c.keyAttestationId === id)
  );

  if (idsToRemove.length > 0) {
    yield* put(itwKeyAttestationsRemoveById(idsToRemove));
  }
}
