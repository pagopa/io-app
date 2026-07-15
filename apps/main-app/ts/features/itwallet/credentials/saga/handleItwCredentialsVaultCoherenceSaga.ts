import { deleteKey } from "@pagopa/io-react-native-crypto";
import { all, call, put, select } from "typed-redux-saga/macro";

import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../store/reducers/types";
import {
  getCredentialKeyTags,
  getCredentialVaultIds,
  getRepresentativeVaultId
} from "../../common/utils/itwCredentialUtils";
import {
  trackItwVaultCoherenceCheckFailed,
  trackItwVaultOrphanedCredentialsFound
} from "../analytics";
import { itwCredentialsRemove } from "../store/actions";
import { itwAllStoredCredentialsSelector } from "../store/selectors";
import { CredentialsVault } from "../utils/vault";

/**
 * Boot-time coherence check between Redux credentials and CredentialsVault. Credentials are matched
 * by their vault id: a non-batch credential maps to a single vault id (its credentialId),
 * a batch credential to one per copy (each copy's keyTag).
 *
 * 1. If the representative copy of a Redux credential is missing from the vault → remove the whole
 *    credential from Redux, delete its crypto keys and drop any remaining vault copies (the raw
 *    JWT is lost, the credential cannot be presented). Credentials with a pending legacy migration
 *    entry are skipped, as they will be retried on the next boot.
 * 2. If a vault entry has no corresponding Redux credential → remove it from the vault (orphan).
 */
export function* handleItwCredentialsVaultCoherenceSaga() {
  const reduxCredentials = yield* select(itwAllStoredCredentialsSelector);

  // Map every expected vault id to its owning credential (a batch credential owns several).
  const expectedByVaultId = new Map(
    reduxCredentials.flatMap(c =>
      getCredentialVaultIds(c).map(vaultId => [vaultId, c] as const)
    )
  );

  const legacyCredentials = yield* select(
    (s: GlobalState) => s.features.itWallet.credentials.legacyCredentials
  );
  // Legacy credentials predate batch support, so each maps to its credentialId.
  const legacyVaultIds = new Set(
    Object.values(legacyCredentials).map(c => c.credentialId)
  );
  const isMixpanelEnabled = yield* select(isMixpanelEnabledSelector);

  try {
    const vaultIds = yield* call(CredentialsVault.list);
    const vaultIdSet = new Set(vaultIds);

    // 1. Redux credentials whose representative copy is missing from the vault → remove
    // Skip credentials with a pending legacy migration entry (migration will retry on next boot)
    const broken = reduxCredentials.filter(c => {
      const representativeId = getRepresentativeVaultId(c);
      return (
        !vaultIdSet.has(representativeId) &&
        !legacyVaultIds.has(representativeId)
      );
    });

    if (broken.length > 0) {
      trackItwVaultOrphanedCredentialsFound(
        {
          credential_ids: broken.map(c => c.credentialId),
          origin: "redux"
        },
        isMixpanelEnabled
      );

      yield* put(itwCredentialsRemove(broken));
      // Delete the crypto keys and any vault copies still present for the broken credentials.
      const keyTagsToDelete = broken.flatMap(getCredentialKeyTags);
      const vaultIdsToRemove = broken
        .flatMap(getCredentialVaultIds)
        .filter(id => vaultIdSet.has(id));
      yield* all(keyTagsToDelete.map(keyTag => call(deleteKey, keyTag)));
      if (vaultIdsToRemove.length > 0) {
        yield* call(CredentialsVault.removeAll, vaultIdsToRemove);
      }
    }

    // 2. Vault entries with no corresponding Redux credential → remove orphans from vault
    const orphanedInVault = vaultIds.filter(
      id => !expectedByVaultId.has(id) && !legacyVaultIds.has(id)
    );

    if (orphanedInVault.length > 0) {
      trackItwVaultOrphanedCredentialsFound(
        {
          credential_ids: orphanedInVault,
          origin: "vault"
        },
        isMixpanelEnabled
      );

      yield* call(CredentialsVault.removeAll, orphanedInVault);
    }
  } catch (e) {
    // This repair step is best-effort at boot: track the failure and let the
    // app continue, so the next launch can retry the cleanup.
    const reason = e instanceof Error ? e.message : String(e);
    trackItwVaultCoherenceCheckFailed(reason, isMixpanelEnabled);
  }
}
