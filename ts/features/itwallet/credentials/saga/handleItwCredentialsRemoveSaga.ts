import { deleteKey } from "@pagopa/io-react-native-crypto";
import * as Sentry from "@sentry/react-native";
import { call, put } from "typed-redux-saga/macro";
import { walletRemoveCards } from "../../../wallet/store/actions/cards";
import { itwCredentialsRemove } from "../store/actions";

/**
 * This saga handles the credential removal action and ensures the consistency between stored credentials and wallet state.
 * It also makes sure that the crypto keys are deleted from the device.
 * @param itwCredentialsRemoveAction
 */
export function* handleItwCredentialsRemoveSaga(
  itwCredentialsRemoveAction: ReturnType<typeof itwCredentialsRemove>
) {
  try {
    const { credentialType, keyTag } = itwCredentialsRemoveAction.payload;
    yield* call(deleteKey, keyTag);
    yield* put(walletRemoveCards([`ITW_${credentialType}`]));
  } catch (e) {
    Sentry.captureException(e);
  }
}
