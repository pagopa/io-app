import { deleteKey } from "@pagopa/io-react-native-crypto";
import { all, call, put, select } from "typed-redux-saga/macro";
import { GlobalState } from "../../../../store/reducers/types";
import { CredentialsVault } from "../utils/vault";
import { itwCredentialsRemove } from "../store/actions";

/**
 * Boot-time coherence check between Redux credentials and CredentialsVault.
 *
 * 1. If a credential is in Redux but not in the vault → remove from Redux
 *    (the raw JWT is lost, the credential cannot be presented).
 * 2. If a credential is in the vault but not in Redux → remove from vault
 *    (orphaned entry, no corresponding metadata).
 */
export function* handleItwCredentialsVaultCoherenceSaga() {
  const reduxCredentials = yield* select(
    (s: GlobalState) => s.features.itWallet.credentials.credentials
  );
  const reduxCredentialIds = Object.keys(reduxCredentials);

  const vaultCredentialIds = yield* call(CredentialsVault.list);

  // 1. Credentials in Redux but missing from vault → remove from Redux
  const missingInVault = reduxCredentialIds.filter(
    id => !vaultCredentialIds.includes(id)
  );

  if (missingInVault.length > 0) {
    const toRemove = missingInVault
      .map(id => reduxCredentials[id])
      .filter(Boolean);
    yield* put(itwCredentialsRemove(toRemove));
    yield* all(toRemove.map(c => call(deleteKey, c.keyTag)));
  }

  // 2. Credentials in vault but missing from Redux → remove orphans from vault
  const orphanedInVault = vaultCredentialIds.filter(
    id => !reduxCredentialIds.includes(id)
  );

  if (orphanedInVault.length > 0) {
    yield* call(CredentialsVault.removeAll, orphanedInVault);
  }
}
