import { call, put, select } from "typed-redux-saga/macro";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../store/reducers/types";
import {
  trackItwVaultMigrationFailed,
  trackItwVaultMigrationRequest,
  trackItwVaultMigrationSuccess
} from "../analytics";
import { CredentialsVault } from "../utils/vault";
import { itwCredentialsVaultMigrationComplete } from "../store/actions";

type VaultMigrationResult =
  | {
      credentialId: string;
      success: true;
    }
  | {
      credentialId: string;
      success: false;
      reason: string;
    };

/**
 * SIW-2178 introduced CredentialsVault to keep raw JWTs out of Redux. Migration
 * v9 populates `legacyCredentials` as a staging area: it copies the
 * pre-migration `credentials` (with the `credential` JWT intact) and strips
 * `credential` from `credentials` so Redux is JWT-free right after upgrade.
 *
 * This saga reads from `legacyCredentials`, writes each JWT to
 * CredentialsVault, and dispatches `itwCredentialsVaultMigrationComplete` with
 * the IDs of succeeded writes so the reducer removes only those entries. Failed
 * ones remain in `legacyCredentials` and retry on the next boot.
 */
export function* handleItwCredentialsVaultMigrationSaga() {
  const legacyCredentials = yield* select(
    (state: GlobalState) =>
      state.features.itWallet.credentials.legacyCredentials
  );

  const entries = Object.values(legacyCredentials);
  if (entries.length === 0) {
    return;
  }

  const isMixpanelEnabled = yield* select(isMixpanelEnabledSelector);
  trackItwVaultMigrationRequest(isMixpanelEnabled);

  // Collect one result per credential so a single vault write failure does not
  // prevent successful entries from being removed from `legacyCredentials`.
  const results: ReadonlyArray<VaultMigrationResult> = yield* call(() =>
    Promise.all(
      entries.map(async c => {
        try {
          await CredentialsVault.store(c.credentialId, c.credential);
          return { credentialId: c.credentialId, success: true as const };
        } catch (e) {
          return {
            credentialId: c.credentialId,
            success: false as const,
            reason: e instanceof Error ? e.message : String(e)
          };
        }
      })
    )
  );

  const succeeded = results.filter(r => r.success).map(r => r.credentialId);
  const failed = results.filter(
    (result): result is Extract<VaultMigrationResult, { success: false }> =>
      !result.success
  );

  if (failed.length > 0) {
    trackItwVaultMigrationFailed(
      {
        credential_ids: failed.map(({ credentialId }) => credentialId),
        reason: Array.from(new Set(failed.map(({ reason }) => reason))).join(
          "; "
        )
      },
      isMixpanelEnabled
    );
  }

  if (succeeded.length > 0) {
    yield* put(itwCredentialsVaultMigrationComplete(succeeded));
  }

  if (failed.length === 0) {
    trackItwVaultMigrationSuccess(isMixpanelEnabled);
  }
}
