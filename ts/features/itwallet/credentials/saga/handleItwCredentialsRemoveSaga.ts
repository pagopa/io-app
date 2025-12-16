import { deleteKey } from "@pagopa/io-react-native-crypto";
import * as Sentry from "@sentry/react-native";
import { call, put, select, all } from "typed-redux-saga/macro";
import { walletRemoveCards } from "../../../wallet/store/actions/cards";
import {
  itwCredentialsRemove,
  itwCredentialsRemoveByType
} from "../store/actions";
import { itwCredentialsListByTypeSelector } from "../store/selectors";

/**
 * This saga handles the credential removal action and ensures the consistency between stored credentials and wallet state.
 * It also makes sure that the crypto keys are deleted from the device.
 * If multiple credentials with the same type are found in the store, all of them are removed.
 * @param itwCredentialsRemoveByType
 */
export function* handleItwCredentialsRemoveSaga(
  action: ReturnType<typeof itwCredentialsRemoveByType>
) {
  try {
    const credentialType = action.payload;

    // We first select all credentials of the same type to get their keytag,
    // THEN dispatch the action to remove them from the store
    const sameTypeCredentials = yield* select(
      itwCredentialsListByTypeSelector(credentialType)
    );

    if (sameTypeCredentials.length > 0) {
      yield* put(itwCredentialsRemove(sameTypeCredentials));
      yield* put(walletRemoveCards([`ITW_${credentialType}`]));
      yield* all(sameTypeCredentials.map(c => call(deleteKey, c.keyTag)));
    }
  } catch (e) {
    Sentry.captureException(e);
  }
}
