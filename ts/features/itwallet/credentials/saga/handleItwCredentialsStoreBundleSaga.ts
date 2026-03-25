import { call, put } from "typed-redux-saga/macro";
import {
  itwCredentialsStore,
  itwCredentialsStoreBundle
} from "../store/actions";
import { CredentialsVault } from "../utils/vault";

/**
 * This saga handles the credential store action and ensures the consistency between
 * secure storage and redux store
 */
export function* handleItwCredentialsStoreBundleSaga(
  action: ReturnType<typeof itwCredentialsStoreBundle>
) {
  try {
    yield* call(() =>
      Promise.all(
        action.payload.map(({ metadata, credential }) =>
          CredentialsVault.store(metadata.credentialId, credential)
        )
      )
    );

    // If all credentials are stored successfully, we can dispatch the action to add them to the store and wallet
    yield* put(
      itwCredentialsStore(action.payload.map(({ metadata }) => metadata))
    );
  } catch {
    // Errors are currently not handled, just make sure the saga doesn't crash
    // TODO log errors to Mixpanel
  }
}
