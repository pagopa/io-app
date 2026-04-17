import { call, put } from "typed-redux-saga/macro";
import { trackItwVaultCredentialStoreFailed } from "../analytics";
import {
  itwCredentialsStore,
  itwCredentialsStoreBundle
} from "../store/actions";
import { CredentialsVault } from "../utils/vault";

/**
 * This saga handles the credential store action and ensures the consistency between
 * secure storage and redux store.
 */
export function* handleItwCredentialsStoreBundleSaga(
  action: ReturnType<typeof itwCredentialsStoreBundle>
) {
  const credentials = action.payload;
  const { onComplete, onError } = action.meta;

  try {
    try {
      yield* call(() =>
        CredentialsVault.storeAll(
          credentials.map(({ metadata, credential }) => ({
            credentialId: metadata.credentialId,
            credential
          }))
        )
      );
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Unknown error");

      trackItwVaultCredentialStoreFailed({
        credential_ids: credentials.map(
          ({ metadata }) => metadata.credentialId
        ),
        reason: error.message
      });

      throw error;
    }

    // If all credentials are stored successfully, we can dispatch the action to add them to the store and wallet
    yield* put(itwCredentialsStore(credentials.map(({ metadata: m }) => m)));

    onComplete?.();
  } catch (e) {
    onError?.(e instanceof Error ? e : new Error("Unknown error"));
  }
}
