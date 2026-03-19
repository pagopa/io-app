import { call, put, select } from "typed-redux-saga/macro";
import { GlobalState } from "../../../../store/reducers/types";
import { CredentialsVault } from "../utils/vault";
import { itwCredentialsVaultMigrationComplete } from "../store/actions";

/**
 * SIW-2178 introduced CredentialsVault to keep raw JWTs out of Redux.
 * Migration v8 populates `legacyCredentials` as a staging area: it copies the
 * pre-migration `credentials` (with the `credential` JWT intact) and strips
 * `credential` from `credentials` so Redux is JWT-free right after upgrade.
 *
 * This saga reads from `legacyCredentials`, writes each JWT to CredentialsVault,
 * and dispatches `itwCredentialsVaultMigrationComplete` with the IDs of succeeded writes
 * so the reducer removes only those entries. Failed ones remain in `legacyCredentials`
 * and retry on the next boot.
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

  const results = yield* call(() =>
    Promise.all(
      entries.map(async c => {
        try {
          await CredentialsVault.store(c.credentialId, c.credential);
          return { credentialId: c.credentialId, success: true as const };
        } catch {
          return { credentialId: c.credentialId, success: false as const };
        }
      })
    )
  );

  const succeeded = results.filter(r => r.success).map(r => r.credentialId);

  if (succeeded.length > 0) {
    yield* put(itwCredentialsVaultMigrationComplete(succeeded));
  }
}
