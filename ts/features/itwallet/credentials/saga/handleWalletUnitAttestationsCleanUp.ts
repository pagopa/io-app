import { put, select } from "typed-redux-saga/macro";
import { itwWalletUnitAttestationsSelector } from "../../walletInstance/store/selectors";
import { itwWalletUnitAttestationsRemoveById } from "../../walletInstance/store/actions";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialsByTypeSelector } from "../store/selectors";

/**
 * Saga that checks for Wallet Unit Attestations that are not associated
 * with any credential and removes them from the store.
 */
export function* handleWalletUnitAttestationsCleanUp() {
  const allCredentialsByType = yield* select(itwCredentialsByTypeSelector);
  const allCredentials = Object.values(
    allCredentialsByType
  ).flatMap<StoredCredential>(Object.values);
  const walletUnitAttestationIds = Object.keys(
    yield* select(itwWalletUnitAttestationsSelector)
  );

  const idsToRemove = walletUnitAttestationIds.filter(
    id => !allCredentials.some(c => c.walletUnitAttestationId === id)
  );

  if (idsToRemove.length > 0) {
    yield* put(itwWalletUnitAttestationsRemoveById(idsToRemove));
  }
}
