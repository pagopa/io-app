import { deleteKey } from "@pagopa/io-react-native-crypto";
import { call, put, select, all } from "typed-redux-saga/macro";
import { walletRemoveCards } from "../../../wallet/store/actions/cards";
import {
  itwCredentialsRemove,
  itwCredentialsRemoveByType
} from "../store/actions";
import { itwCredentialsListByTypeSelector } from "../store/selectors";
import { CredentialsVault } from "../utils/vault";

/**
 * This saga handles the credential removal action and ensures the consistency between stored credentials and wallet state.
 * It also makes sure that the crypto keys are deleted from the device.
 * If multiple credentials with the same type are found in the store, all of them are removed.
 * @param itwCredentialsRemoveByType
 */
export function* handleItwCredentialsRemoveByTypeSaga(
  action: ReturnType<typeof itwCredentialsRemoveByType>
) {
  const credentialType = action.payload;
  const { onComplete, onError } = action.meta;

  try {
    // We first select all credentials of the same type to get their keytag,
    // THEN dispatch the action to remove them from the store
    const sameTypeCredentials = yield* select(
      itwCredentialsListByTypeSelector(credentialType)
    );

    if (sameTypeCredentials.length > 0) {
      // Remove from vault first; only proceed with Redux/key cleanup on success
      yield* call(
        CredentialsVault.removeAll,
        sameTypeCredentials.map(c => c.credentialId)
      );
      yield* put(itwCredentialsRemove(sameTypeCredentials));
      yield* put(walletRemoveCards([`ITW_${credentialType}`]));
      yield* all(sameTypeCredentials.map(c => call(deleteKey, c.keyTag)));
    }
    onComplete?.();
  } catch (e) {
    // TODO [SIW-4080] Log failures to Mixpanel
    onError?.(e instanceof Error ? e : new Error("Unknown error"));
  }
}
