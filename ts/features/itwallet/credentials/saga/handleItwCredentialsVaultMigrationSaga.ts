import * as Sentry from "@sentry/react-native";
import { call, put, select } from "typed-redux-saga/macro";
import { GlobalState } from "../../../../store/reducers/types";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { CredentialsVault } from "../utils/vault";
import { itwCredentialsVaultMigrationComplete } from "../store/actions";

type LegacyCredentialEntry = CredentialMetadata & { credential?: string };
type LegacyCredentialEntryWithJwt = CredentialMetadata & { credential: string };

const hasLegacyCredential = (
  c: LegacyCredentialEntry
): c is LegacyCredentialEntryWithJwt => c.credential !== undefined;

const asCredentialMetadata = ({
  credential: _credential,
  ...metadata
}: LegacyCredentialEntry): CredentialMetadata => metadata;

/**
 * SIW-2178 introduced CredentialsVault to keep raw JWTs out of Redux, but
 * users who had already issued credentials still have the `credential` field
 * living in their persisted Redux state. We can't do this in redux-persist's
 * createMigrate() because that's synchronous, so we do it here at boot instead.
 *
 * We only remove `credential` from Redux after every vault write has succeeded,
 * so a partial failure can't cause data loss — the field stays in Redux and
 * the whole migration retries on the next boot.
 */
export function* handleItwCredentialsVaultMigrationSaga() {
  const rawCredentials = yield* select(
    (state: GlobalState) =>
      state.features.itWallet.credentials.credentials as Record<
        string,
        LegacyCredentialEntry
      >
  );

  const legacy = Object.values(rawCredentials).filter(hasLegacyCredential);

  if (legacy.length === 0) {
    return;
  }

  // CredentialsVault.store swallows errors and returns false, so we can't rely
  // on a rejection to detect failure — we have to inspect the results.
  const results = yield* call(() =>
    Promise.all(
      legacy.map(c => CredentialsVault.store(c.credentialId, c.credential))
    )
  );

  if (!results.every(Boolean)) {
    // Keep Redux intact: the field survives, and we retry on the next boot.
    Sentry.captureException(
      new Error("One or more credential vault migrations failed"),
      { tags: { isRequired: true }, extra: { operation: "vaultMigration" } }
    );
    return;
  }

  yield* put(
    itwCredentialsVaultMigrationComplete(legacy.map(asCredentialMetadata))
  );
}
